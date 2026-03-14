import PdfUploadForm from "@/components/admin/PdfUploadForm";
import Link from "next/link";

export default function UploadBookPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/books" className="text-gray-400 hover:text-gray-600 font-bold">
          ← Books
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-3xl font-black text-gray-800">📤 Upload Book</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8">
        <p className="text-gray-500 mb-6">
          Upload a PDF book. The text will be automatically extracted and stored sentence by sentence.
        </p>
        <PdfUploadForm />
      </div>
    </div>
  );
}
