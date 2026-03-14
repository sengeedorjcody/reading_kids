import Link from "next/link";
import TextBookForm from "@/components/admin/TextBookForm";

export default function CreateTextBookPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/books" className="text-gray-400 hover:text-gray-600 font-bold text-sm">
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-gray-800">✍️ Create Text Book</h1>
      </div>

      <p className="text-gray-400 text-sm max-w-lg">
        Type Japanese sentences directly — no PDF needed. Each page is a separate text block.
        Sentences are auto-detected at <span className="font-bold text-gray-500">。！？</span> and line breaks.
      </p>

      <TextBookForm />
    </div>
  );
}
