"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PublishFamilyTopicButton({ topicId, isPublished }: { topicId: string; isPublished: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    setSaving(true);
    try {
      await fetch(`/api/family-talk/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      className={`font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 ${
        isPublished
          ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
          : "bg-green-500 hover:bg-green-600 text-white"
      }`}
    >
      {saving ? "…" : isPublished ? "Unpublish" : "🚀 Publish"}
    </button>
  );
}
