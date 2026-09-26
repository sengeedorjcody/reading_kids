import FamilyTopicForm from "@/components/admin/FamilyTopicForm";
import Link from "next/link";

export default function NewFamilyTopicPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/family-talk" className="text-gray-400 hover:text-gray-600 font-bold">
          ← Family Talk
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-3xl font-black text-gray-800">➕ New Topic</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8">
        <FamilyTopicForm />
      </div>
    </div>
  );
}
