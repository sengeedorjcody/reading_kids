import Link from "next/link";
import BellaReadingForm from "@/components/admin/BellaReadingForm";

export default function CreateBellaReadingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bella-reading"
          className="text-gray-400 hover:text-gray-600 font-bold text-sm"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-black text-gray-800">
          🌸 New Bella Reading
        </h1>
      </div>

      <p className="text-gray-500 text-sm max-w-2xl">
        Enter or paste the reading passage below and add comprehension questions.
        Each word in the text becomes tappable for instant dictionary &amp; Mongolian translation.
      </p>

      <BellaReadingForm />
    </div>
  );
}
