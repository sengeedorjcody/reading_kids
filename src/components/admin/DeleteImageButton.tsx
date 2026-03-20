"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeleteImageButton({ imageId }: { imageId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/upload/image/${imageId}`, { method: "DELETE" });
      router.refresh();
    });
  };

  if (confirm) {
    return (
      <div className="flex gap-1 mt-2">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-bold py-1 rounded-xl transition-colors"
        >
          {isPending ? "…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold py-1 rounded-xl transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="mt-2 w-full text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
    >
      🗑 Delete
    </button>
  );
}
