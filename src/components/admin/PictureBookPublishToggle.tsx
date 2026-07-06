"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PictureBookPublishToggle({ pictureBookId, isPublished }: { pictureBookId: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      await fetch(`/api/picture-books/${pictureBookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 ${
        isPublished ? "bg-gray-100 hover:bg-gray-200 text-gray-600" : "bg-green-100 hover:bg-green-200 text-green-700"
      }`}
    >
      {isPublished ? "Unpublish" : "Publish"}
    </button>
  );
}
