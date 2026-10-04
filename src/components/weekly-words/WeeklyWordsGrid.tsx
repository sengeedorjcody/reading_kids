"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IWeeklyWords } from "@/types";

export default function WeeklyWordsGrid({
  weeks,
  serverCompletedWeeks = [],
}: {
  weeks: IWeeklyWords[];
  serverCompletedWeeks: number[];
}) {
  const [completedSet, setCompletedSet] = useState<Set<number>>(
    () => new Set(serverCompletedWeeks)
  );

  useEffect(() => {
    try {
      const local: number[] = JSON.parse(
        localStorage.getItem("reading_kids_completed_weeks") || "[]"
      );
      setCompletedSet((prev) => {
        const next = new Set(prev);
        local.forEach((num) => next.add(num));
        return next;
      });
    } catch {}
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {weeks.map((week) => {
        const isDone = completedSet.has(week.weekNumber);
        const wordCount = week.words?.length || 0;

        return (
          <Link
            key={week._id}
            href={`/weekly-words/${week.weekNumber}`}
            className={`group relative flex flex-col rounded-3xl overflow-hidden transition-all active:scale-[0.98] shadow-xl p-5 border-2 ${
              isDone
                ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400/70"
                : "bg-white/10 border-white/10 hover:border-blue-400/50 hover:bg-white/15"
            }`}
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Header row: Week badge & Done tag / word count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md ${
                    isDone
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/40"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-900/40"
                  }`}
                >
                  {week.weekNumber}
                </span>
                <div>
                  <h2
                    className={`font-black text-lg transition-colors ${
                      isDone
                        ? "text-white group-hover:text-emerald-300"
                        : "text-white group-hover:text-blue-300"
                    }`}
                  >
                    {week.title}
                  </h2>
                  {week.titleJapanese && (
                    <p className="text-xs text-white/50 font-bold">
                      {week.titleJapanese}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5">
                {isDone && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                    <span>✓</span>
                    <span>Done</span>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/10">
                  {wordCount} words
                </span>
              </div>
            </div>

            {/* Words preview chips */}
            <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
              {(week.words || []).map((w, idx) => (
                <span
                  key={w._id || idx}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                    isDone
                      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
                      : "bg-white/5 text-white/80 border-white/10"
                  }`}
                  style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}
                >
                  {w.hiragana || w.japanese_word}
                </span>
              ))}
            </div>

            {/* Bottom button indicator */}
            <div
              className={`w-full py-3 rounded-2xl border text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                isDone
                  ? "bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400/40 text-emerald-200 group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white"
                  : "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border-blue-400/40 text-blue-200 group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white"
              }`}
            >
              <span>{isDone ? "Review Quiz" : "Start Quiz"}</span>
              <span className="transition-transform group-hover:translate-x-1">
                ➔
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
