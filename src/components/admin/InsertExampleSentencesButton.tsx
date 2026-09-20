"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InsertExampleSentencesButton({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/topics/${topicId}/sentences/examples`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(
        data.inserted === 0
          ? "All examples are already in this topic."
          : `Inserted ${data.inserted} example sentence${data.inserted === 1 ? "" : "s"}${data.skippedDuplicates ? ` (${data.skippedDuplicates} already present)` : ""}.`
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to insert examples");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-4 py-2.5 rounded-xl border border-purple-200 transition-colors text-sm disabled:opacity-50"
      >
        {loading ? "Inserting…" : "📋 Insert Examples"}
      </button>
      {message && <span className="text-xs text-gray-500 font-bold">{message}</span>}
    </div>
  );
}
