"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteConversationButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this conversation and all its pages?")) return;
    setLoading(true);
    await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0 disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
