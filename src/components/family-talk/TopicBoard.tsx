"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IFamilyTalkTopic } from "@/types";
import { buildScatterLayout } from "@/lib/scatterLayout";

const CARD_COLORS = [
  "#c2410c", "#9d174d", "#7c3aed", "#0369a1",
  "#15803d", "#a16207", "#b91c1c", "#0f766e",
];

export default function TopicBoard({ topics }: { topics: IFamilyTalkTopic[] }) {
  const router = useRouter();
  const layout = useMemo(() => buildScatterLayout(topics.length), [topics.length]);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #7c2d12 0%, #831843 45%, #3b0764 100%)" }}
    >
      <div className="flex-shrink-0 px-5 pt-6 pb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-3xl">👨‍👩‍👧‍👦</span> Family Talk
          </h1>
          <p className="text-white/70 text-sm mt-1">Тавь сэдвийг сонгоод үгсийг хамт үзье!</p>
        </div>
        <Link
          href="/"
          className="flex-shrink-0 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90"
        >
          🏠
        </Link>
      </div>

      <div className="flex-1 relative">
        {topics.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <p className="text-white/70 font-bold">No topics yet.</p>
          </div>
        )}
        {topics.map((topic, i) => {
          const slot = layout[i];
          const color = CARD_COLORS[i % CARD_COLORS.length];
          if (!slot) return null;
          return (
            <button
              key={topic._id}
              onClick={() => router.push(`/family-talk/${topic._id}`)}
              className="absolute flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                transform: `translate(-50%, -50%) rotate(${slot.rotate}deg)`,
              }}
            >
              <div
                className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center shadow-xl border-2 border-white/30"
                style={{ background: topic.coverImageUrl ? undefined : color }}
              >
                {topic.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={topic.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">💬</span>
                )}
              </div>
              <span
                className="text-white text-xs font-black text-center leading-tight max-w-[100px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.3)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
              >
                {topic.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
