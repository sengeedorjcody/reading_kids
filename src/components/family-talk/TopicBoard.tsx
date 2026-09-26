"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { IConversation } from "@/types";
import { buildScatterLayout } from "@/lib/scatterLayout";

const CARD_COLORS = [
  "#f97316", "#ec4899", "#8b5cf6", "#0ea5e9",
  "#22c55e", "#f59e0b", "#ef4444", "#14b8a6",
];

export default function TopicBoard({ topics }: { topics: IConversation[] }) {
  const router = useRouter();
  const layout = useMemo(() => buildScatterLayout(topics.length), [topics.length]);

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #ff8a5c 0%, #ff5c8a 45%, #b13bff 100%)" }}
    >
      <div className="flex-shrink-0 px-5 pt-6 pb-3">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <span className="text-3xl">👨‍👩‍👧‍👦</span> Family Talk
        </h1>
        <p className="text-white/70 text-sm mt-1">Тавь сэдвийг сонгоод үгсийг хамт үзье!</p>
      </div>

      <div className="flex-1 relative">
        {topics.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <p className="text-white/70 font-bold">No conversation topics with vocabulary yet.</p>
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
                style={{ background: topic.backgroundImageUrl ? undefined : color }}
              >
                {topic.backgroundImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={topic.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">💬</span>
                )}
              </div>
              <span
                className="text-white text-xs font-black text-center leading-tight max-w-[100px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,0,0,0.25)", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
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
