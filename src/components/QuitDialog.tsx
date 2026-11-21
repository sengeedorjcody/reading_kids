"use client";

import { useEffect, useRef } from "react";

/**
 * While `active`, a phone's back gesture / browser Back does not leave the
 * page: it calls `onBack` instead (so the caller can open the quit dialog).
 * Works by keeping one extra history entry on top while active.
 */
export function useBackGuard(active: boolean, onBack: () => void) {
  const cb = useRef(onBack);
  cb.current = onBack;

  useEffect(() => {
    if (!active) return;
    // Spread the existing state so Next's router bookkeeping (__NA etc.) survives.
    const push = () => history.pushState({ ...history.state, quizGuard: true }, "");
    push();
    let pushed = true;
    const onPop = () => {
      push();
      cb.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (pushed && history.state?.quizGuard) {
        pushed = false;
        history.back(); // drop our extra entry
      }
    };
  }, [active]);
}

export default function QuitDialog({
  onContinue,
  onQuit,
  onRestart,
}: {
  onContinue: () => void;
  onQuit: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-slate-800 shadow-2xl">
        <div className="font-mn text-lg font-black">Гарах уу?</div>
        <p className="font-mn mt-1 text-sm text-slate-500">
          Гарвал энэ тестийн явц хадгалагдахгүй.
        </p>
        <div className="mt-4 grid gap-2">
          <button
            onClick={onContinue}
            className="font-mn rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 font-black text-white active:scale-95 transition-transform"
          >
            Үргэлжлүүлэх
          </button>
          <button
            onClick={onRestart}
            className="font-mn rounded-2xl bg-slate-100 py-3 font-black active:scale-95 transition-transform"
          >
            🔄 Эхнээс нь эхлэх
          </button>
          <button
            onClick={onQuit}
            className="font-mn rounded-2xl bg-slate-100 py-3 font-black text-red-600 active:scale-95 transition-transform"
          >
            ✕ Гарах
          </button>
        </div>
      </div>
    </div>
  );
}
