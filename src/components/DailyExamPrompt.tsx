"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const LOGIN_PROMPT_KEY = "dailyLoginPromptDate";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyExamPrompt() {
  const { status } = useSession();
  const router = useRouter();
  const [stage, setStage] = useState<"login" | "exam" | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      if (localStorage.getItem(LOGIN_PROMPT_KEY) !== todayStr()) setStage("login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/user/exam-prompt")
        .then((r) => r.json())
        .then((data) => {
          if (data.lastExamPromptDate !== data.today) setStage("exam");
        })
        .catch(() => {});
    }
  }, [status]);

  const dismissLogin = (goLogin: boolean) => {
    localStorage.setItem(LOGIN_PROMPT_KEY, todayStr());
    setStage(null);
    if (goLogin) router.push("/login");
  };

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
        {stage === "login" ? (
          <>
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-white font-black text-xl mb-2">Log in for daily practice!</h2>
            <p className="text-white/50 text-sm mb-6">Save words and get a daily flashcard round.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => dismissLogin(true)}
                className="w-full py-3.5 rounded-2xl font-black text-white active:scale-95"
                style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}
              >
                Log In
              </button>
              <button
                onClick={() => dismissLogin(false)}
                className="w-full py-3 rounded-2xl font-bold text-white/50 active:scale-95"
              >
                Not now
              </button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
