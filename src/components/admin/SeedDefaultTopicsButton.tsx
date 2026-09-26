"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SeedDefaultTopicsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/family-talk/seed-defaults", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(
        data.topicsCreated === 0
          ? "Default topics already exist."
          : `Added ${data.topicsCreated} topic${data.topicsCreated === 1 ? "" : "s"} with ${data.wordsCreated} words.`
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to seed defaults");
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
        {loading ? "Seeding…" : "🌱 Seed Default Topics"}
      </button>
      {message && <span className="text-xs text-gray-500 font-bold">{message}</span>}
    </div>
  );
}
