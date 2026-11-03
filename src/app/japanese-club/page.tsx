export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import FamilyTalkTopic from "@/lib/db/models/FamilyTalkTopic";
import FamilyTalkWord from "@/lib/db/models/FamilyTalkWord";
import Conversation from "@/lib/db/models/Conversation";
import ConversationPage from "@/lib/db/models/ConversationPage";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Topic from "@/lib/db/models/Topic";
import Sentence from "@/lib/db/models/Sentence";
import { enrichFamilyWordsFromDictionary } from "@/lib/familyTalk/enrichFromDictionary";
import { IFamilyTalkTopic, IFamilyTalkWord, ITopic, ITopicSentence } from "@/types";
import JapaneseClubClient, {
  ClubCategoryItem,
  ClubWordItem,
  ClubSentenceItem,
} from "@/components/japanese-club/JapaneseClubClient";

async function getClubData(): Promise<{
  conversationCategories: ClubCategoryItem[];
  sentenceTopics: ClubCategoryItem[];
}> {
  try {
    await connectDB();

    const [familyTopicsRaw, conversationsRaw, sentenceTopicsRaw] = await Promise.all([
      FamilyTalkTopic.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean(),
      Conversation.find({ isPublished: true }).sort({ createdAt: -1 }).lean(),
      Topic.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const familyTopics = JSON.parse(JSON.stringify(familyTopicsRaw)) as IFamilyTalkTopic[];
    const sentenceTopicsList = JSON.parse(JSON.stringify(sentenceTopicsRaw)) as ITopic[];

    // 1. Fetch FamilyTalk words and enrich from DictionaryWord
    const familyWordsRaw = await FamilyTalkWord.find({
      topicId: { $in: familyTopics.map((t) => t._id) },
    })
      .sort({ createdAt: 1 })
      .lean();
    const enrichedFamilyWords = await enrichFamilyWordsFromDictionary(
      JSON.parse(JSON.stringify(familyWordsRaw)) as IFamilyTalkWord[]
    );

    const familyWordsByTopic = new Map<string, ClubWordItem[]>();
    for (const w of enrichedFamilyWords) {
      const list = familyWordsByTopic.get(String(w.topicId)) ?? [];
      list.push({
        _id: String(w._id),
        japanese: w.japanese,
        hiragana: w.hiragana,
        romaji: w.romaji,
        english_meaning: w.english_meaning,
        mongolian_meaning: w.mongolian_meaning,
        imageUrl: w.imageUrl,
        audioUrl: w.audioUrl,
        example_sentence: w.example_sentence,
        example_sentence_reading: w.example_sentence_reading,
      });
      familyWordsByTopic.set(String(w.topicId), list);
    }

    // 2. Fetch all sentences for published Sentence Topics
    const sentencesRaw = await Sentence.find({
      topicId: { $in: sentenceTopicsList.map((t) => t._id) },
    })
      .sort({ order: 1 })
      .lean();
    const allSentences = JSON.parse(JSON.stringify(sentencesRaw)) as ITopicSentence[];

    const sentencesByTopic = new Map<string, ClubSentenceItem[]>();
    for (const s of allSentences) {
      const list = sentencesByTopic.get(String(s.topicId)) ?? [];
      list.push({
        _id: String(s._id),
        japanese: s.japanese,
        romaji: s.romaji,
        english_meaning: s.english_meaning,
        mongolian_meaning: s.mongolian_meaning,
        imageUrl: s.imageUrl,
      });
      sentencesByTopic.set(String(s.topicId), list);
    }

    // 3. Build conversation categories from FamilyTalkTopic
    const conversationCategories: ClubCategoryItem[] = familyTopics.map((ft) => {
      const words = familyWordsByTopic.get(String(ft._id)) ?? [];
      return {
        _id: `ft-${ft._id}`,
        kind: "conversation",
        title: ft.title,
        titleJapanese: ft.titleJapanese,
        description: ft.description,
        coverImageUrl: ft.coverImageUrl || words.find((w) => w.imageUrl)?.imageUrl,
        words,
        sentences: [],
      };
    });

    // 4. Also include published Conversations (linked DictionaryWords + ConversationPage dialogue lines)
    if (conversationsRaw.length > 0) {
      const convIds = conversationsRaw.map((c) => c._id);
      const [convDictWordsRaw, convPagesRaw] = await Promise.all([
        DictionaryWord.find({ conversationId: { $in: convIds } })
          .sort({ japanese_word: 1 })
          .lean(),
        ConversationPage.find({ conversationId: { $in: convIds } })
          .sort({ pageNumber: 1 })
          .lean(),
      ]);

      const convWordsMap = new Map<string, ClubWordItem[]>();
      for (const dw of convDictWordsRaw) {
        const cid = String(dw.conversationId);
        const list = convWordsMap.get(cid) ?? [];
        list.push({
          _id: String(dw._id),
          japanese: dw.japanese_word,
          hiragana: dw.hiragana,
          romaji: dw.romaji,
          english_meaning: dw.english_meaning,
          mongolian_meaning: dw.mongolian_meaning,
          imageUrl: dw.example_image_url,
          audioUrl: dw.pronunciation_audio_url,
          example_sentence: dw.example_sentence,
          example_sentence_reading: dw.example_sentence_reading,
        });
        convWordsMap.set(cid, list);
      }

      const convSentencesMap = new Map<string, ClubSentenceItem[]>();
      for (const pg of convPagesRaw) {
        const cid = String(pg.conversationId);
        const list = convSentencesMap.get(cid) ?? [];
        for (const ch of pg.characters ?? []) {
          if (ch.text && ch.text.trim()) {
            list.push({
              _id: `${pg._id}-ch-${list.length}`,
              japanese: ch.text.trim(),
              imageUrl: pg.backgroundImageUrl,
            });
          }
        }
        for (const tx of pg.texts ?? []) {
          if (tx.text && tx.text.trim()) {
            list.push({
              _id: `${pg._id}-tx-${list.length}`,
              japanese: tx.text.trim(),
              imageUrl: pg.backgroundImageUrl,
            });
          }
        }
        convSentencesMap.set(cid, list);
      }

      const existingTitles = new Set(conversationCategories.map((c) => c.title.toLowerCase()));
      for (const conv of conversationsRaw) {
        const cid = String(conv._id);
        const words = convWordsMap.get(cid) ?? [];
        const sentences = convSentencesMap.get(cid) ?? [];
        if (words.length === 0 && sentences.length === 0 && existingTitles.has(conv.title.toLowerCase())) {
          continue;
        }
        conversationCategories.push({
          _id: `conv-${cid}`,
          kind: "conversation",
          title: conv.title,
          description: conv.description,
          coverImageUrl: conv.backgroundImageUrl,
          words,
          sentences,
        });
      }
    }

    // 5. Build Sentence Topics
    const sentenceTopics: ClubCategoryItem[] = sentenceTopicsList.map((st) => {
      const sentences = sentencesByTopic.get(String(st._id)) ?? [];
      return {
        _id: `st-${st._id}`,
        kind: "sentence",
        title: st.title,
        titleJapanese: st.titleJapanese,
        description: st.description,
        coverImageUrl: sentences.find((s) => s.imageUrl)?.imageUrl,
        words: [],
        sentences,
      };
    });

    return { conversationCategories, sentenceTopics };
  } catch (err) {
    console.error("Failed to load Japanese Club data:", err);
    return { conversationCategories: [], sentenceTopics: [] };
  }
}

export default async function JapaneseClubPage() {
  const { conversationCategories, sentenceTopics } = await getClubData();
  return (
    <JapaneseClubClient
      conversationCategories={conversationCategories}
      sentenceTopics={sentenceTopics}
    />
  );
}
