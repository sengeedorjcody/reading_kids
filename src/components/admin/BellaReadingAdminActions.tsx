"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteBellaReadingButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) return;
    setBusy(true);
    try {
      await fetch(`/api/bella-reading/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      className="text-rose-500 hover:text-rose-700 font-bold text-xs disabled:opacity-50"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}

export function PublishBellaReadingToggle({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    setBusy(true);
    try {
      await fetch(`/api/bella-reading/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
        isPublished
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}

export function SeedSampleBellaReadingButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSeed = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/bella-reading/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.alreadyExists ? "Sample already exists!" : "Sample added!");
      router.refresh();
    } catch {
      setMsg("Failed to add sample");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleSeed}
        disabled={busy}
        className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-2.5 px-4 rounded-2xl text-sm transition-colors disabled:opacity-50"
      >
        {busy ? "Adding…" : "🐻 Insert Sample (うみへの ながい たび)"}
      </button>
      {msg && <span className="text-xs font-bold text-emerald-600">{msg}</span>}
    </div>
  );
}
