import WordForm from "@/components/admin/WordForm";
import Link from "next/link";

export default function NewWordPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dictionary" className="text-gray-400 hover:text-gray-600 font-bold">
          ← Dictionary
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-3xl font-black text-gray-800">➕ Add New Word</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8">
        <WordForm />
      </div>
    </div>
  );
}
