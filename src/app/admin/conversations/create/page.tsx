import ConversationForm from "@/components/admin/ConversationForm";

export default function CreateConversationPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-gray-700">💬 New Conversation</h1>
      <ConversationForm />
    </div>
  );
}
