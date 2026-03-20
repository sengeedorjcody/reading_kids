export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Conversation from "@/lib/db/models/Conversation";
import DictionaryWord from "@/lib/db/models/DictionaryWord";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getData(conversationId: string) {
  await connectDB();
  const [conv, words] = await Promise.all([
    Conversation.findById(conversationId).lean(),
    DictionaryWord.find({ conversationId }).sort({ japanese_word: 1 }).lean(),
  ]);
  return {
    conv: conv ? JSON.parse(JSON.stringify(conv)) : null,
    words: JSON.parse(JSON.stringify(words)),
  };
}

export default async function ConversationDictionaryPage({ params }: { params: { conversationId: string } }) {
  const { conv, words } = await getData(params.conversationId);
  if (!conv) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/conversations/${params.conversationId}`} className="text-gray-400 hover:text-gray-600 font-bold text-sm">
          ← {conv.title}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-black text-gray-800">📝 Dictionary</h1>
        <span className="text-sm text-gray-400 font-bold">({words.length} words)</span>
      </div>

      {words.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg text-gray-400 font-bold">No words linked to this conversation</p>
          <p className="text-sm text-gray-400 mt-1">
            Import a dictionary Excel file and select <span className="font-bold text-purple-500">{conv.title}</span> in the conversation picker.
          </p>
          <Link href="/admin/dictionary" className="mt-3 inline-block text-purple-500 font-bold hover:underline">
            Go to Dictionary →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-bold text-gray-400">Word</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Romaji</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">English</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Mongolian</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">Image</th>
                <th className="text-left p-4 text-sm font-bold text-gray-400">JLPT</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, i) => (
                <tr key={word._id} className={i !== words.length - 1 ? "border-b border-gray-50" : ""}>
                  <td className="p-4">
                    <div className="text-2xl font-bold text-gray-800">{word.japanese_word}</div>
                    {word.hiragana && word.hiragana !== word.japanese_word && (
                      <div className="text-sm text-pink-400">{word.hiragana}</div>
                    )}
                  </td>
                  <td className="p-4 text-blue-400 italic text-sm">{word.romaji}</td>
                  <td className="p-4 text-gray-600 text-sm">{word.english_meaning}</td>
                  <td className="p-4 text-gray-600 text-sm">{word.mongolian_meaning}</td>
                  <td className="p-4">
                    {word.example_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={word.example_image_url} alt={word.japanese_word} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {word.jlpt_level && (
                      <span className="text-xs bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full">{word.jlpt_level}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
