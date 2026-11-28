import { IBellaReading } from "@/types";
import { rawTextToBellaSentences } from "./bellaTokenizer";

export const SAMPLE_BELLA_ID = "sample-umi-e-no-nagai-tabi-3";

export const SAMPLE_RAW_TEXT = `「うみは どっちだったかしら。」
百日ちかくも あるいて ここに やって きて、
ふかい あなを ほった。
ふたりを うんだ。ふたりを そだてた。
水しか のめなかった かあさんぐまは、
そろそろ うみへ もどらないと、
からだが もたなく なる。
ゆきの 上に うずくまり、かあさんぐまは
じっと 耳を すまし、
目を とじる。
うみからの かぜの 音でも ききとろうと して いるように。
うみからの かすかな かおりでも かぎとろうと して いるように。`;

export const SAMPLE_QUESTIONS = [
  {
    question: "かあさんぐまは どのくらい あるいて ここに やって きましたか？",
    questionTranslation: "Ээж баавгай энд ирэхийн тулд хэр удаан алхсан бэ?",
    options: ["十日ちかく", "百日ちかく", "一日だけ", "三日ちかく"],
    correctIndex: 1,
    explanation: "「百日ちかくも あるいて ここに やって きて」と かいて あります。",
  },
  {
    question: "かあさんぐまは あなの なかで なにしか のめませんでしたか？",
    questionTranslation: "Ээж баавгай нүхэнд зөвхөн юу л ууж чадаж байсан бэ?",
    options: ["ミルク", "ジュース", "水", "おちゃ"],
    correctIndex: 2,
    explanation: "「水しか のめなかった かあさんぐまは」と かいて あります。",
  },
  {
    question: "かあさんぐまは そろそろ どこへ もどらないと いけませんか？",
    questionTranslation: "Ээж баавгай удахгүй хаашаа буцах ёстой вэ?",
    options: ["やま", "もり", "かわ", "うみ"],
    correctIndex: 3,
    explanation:
      "「そろそろ うみへ もどらないと、からだが もたなく なる。」と かいて あります。",
  },
  {
    question: "ゆきの 上に うずくまって、かあさんぐまは なにを しましたか？",
    questionTranslation: "Цасан дээр суугаад ээж баавгай юу хийсэн бэ?",
    options: [
      "じっと 耳を すまし、目を とじた",
      "おおきな こえで ないた",
      "すぐ にげだした",
      "さかなを たべた",
    ],
    correctIndex: 0,
    explanation:
      "うみからの かぜの 音や かすかな かおりを かんじとろうと、じっと 耳を すまし、目を とじました。",
  },
];

export const SAMPLE_BELLA_DATA = {
  title: "うみへの ながい たび (3)",
  titleJapanese: "かあさんぐまの おはなし",
  level: "beginner" as const,
  description:
    "ゆきの 上で うみを さがす かあさんぐまの おはなしを よんで、しつもんに こたえよう！",
  coverImageUrl: "/bella-reading/umi-e-no-nagai-tabi-3.jpg",
  rawText: SAMPLE_RAW_TEXT,
  questions: SAMPLE_QUESTIONS,
  order: 1,
  isPublished: true,
};

export function getSampleBellaReading(): IBellaReading {
  const sentences = rawTextToBellaSentences(SAMPLE_RAW_TEXT).map((s, i) => ({
    _id: `sample-s-${i}`,
    text: s.text,
    words: s.words,
  }));
  const now = new Date().toISOString();
  return {
    _id: SAMPLE_BELLA_ID,
    ...SAMPLE_BELLA_DATA,
    sentences,
    questions: SAMPLE_QUESTIONS.map((q, i) => ({ ...q, _id: `sample-q-${i}` })),
    createdAt: now,
    updatedAt: now,
  };
}
