import PictureBookForm from "@/components/admin/PictureBookForm";

export default function CreatePictureBookPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-gray-700">🖼️ New Picture Book</h1>
      <PictureBookForm />
    </div>
  );
}
