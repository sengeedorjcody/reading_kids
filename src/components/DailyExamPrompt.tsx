"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DailyExamPrompt() {
  const { status } = useSession();
  const router = useRouter();
  const [stage, setStage] = useState<"exam" | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/user/exam-prompt")
      .then((r) => r.json())
      .then((data) => {
        if (data.lastExamPromptDate !== data.today) setStage("exam");
      })
      .catch(() => {});
  }, [status]);

  const answerExam = async (yes: boolean) => {
    setStage(null);
    try {
      await fetch("/api/user/exam-prompt", { method: "POST" });
    } catch {}
    if (yes) router.push("/flashcards");
  };

  if (!stage) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="text-5xl mb-3">🃏</div>
        <h2 className="text-white font-black text-xl mb-2">Today&apos;s practice?</h2>
        <p className="text-white/50 text-sm mb-6">Do a quick round of flashcards!</p>
        <div className="flex gap-3">
          <button
            onClick={() => answerExam(false)}
            className="flex-1 py-3.5 rounded-2xl font-bold text-white/70 bg-white/10 active:scale-95"
          >
            Not now
          </button>
          <button
            onClick={() => answerExam(true)}
            className="flex-1 py-3.5 rounded-2xl font-black text-white active:scale-95"
            style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
          >
            Yes! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
