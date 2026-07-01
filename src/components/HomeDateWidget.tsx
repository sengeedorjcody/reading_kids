"use client";

import { useState, useEffect, useCallback } from "react";
import useSpeech from "@/hooks/useSpeech";

const WEEKDAY_JP = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_FULL = ["にちようび", "げつようび", "かようび", "すいようび", "もくようび", "きんようび", "どようび"];
const WEEKDAY_MN = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getWeekDates(offset: number) {
  const today = new Date();
  // Monday = start of week
  const dow = today.getDay(); // 0=Sun
  const mondayDiff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayDiff + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function HomeDateWidget() {
  const [now, setNow] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const { speak } = useSpeech();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const weekDates = getWeekDates(weekOffset);
  const todayIdx = now.getDay(); // 0=Sun

  const speakDate = useCallback(() => {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const wd = WEEKDAY_FULL[now.getDay()];
    speak(`${y}年${m}月${d}日、${wd}`);
  }, [now, speak]);

  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  const wdJP = `${WEEKDAY_JP[now.getDay()]}曜日`;
  const wdMN = WEEKDAY_MN[now.getDay()];

  return (
    <div
      className="mx-4 mt-3 mb-1 rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Date + time row */}
      <button
        onClick={speakDate}
        className="w-full flex items-center justify-between px-4 py-3 active:opacity-70 transition-opacity"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-lg leading-tight">{dateStr}</span>
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.4)", color: "#c4b5fd" }}
            >
              {wdJP}
            </span>
          </div>
          <div className="text-white/50 text-xs font-bold mt-0.5">{wdMN} · タップして聞く</div>
        </div>
        <div
          className="text-right font-black tabular-nums"
          style={{ color: "#a78bfa", fontSize: "1.1rem", letterSpacing: "0.05em" }}
        >
          {timeStr}
        </div>
      </button>

      {/* Week strip */}
      <div className="px-2 pb-2">
        {/* Nav row */}
        <div className="flex items-center justify-between mb-1.5 px-1">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="text-xs font-black text-white/40 hover:text-white/70 active:scale-90 transition-all px-2 py-1 rounded-xl"
          >
            ← 先週
          </button>
          <span className="text-[10px] font-bold text-white/30">
            {weekDates[0].getMonth() + 1}/{weekDates[0].getDate()} – {weekDates[6].getMonth() + 1}/{weekDates[6].getDate()}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="text-xs font-black text-white/40 hover:text-white/70 active:scale-90 transition-all px-2 py-1 rounded-xl"
          >
            来週 →
          </button>
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d, i) => {
            const isToday = isSameDay(d, now);
            // i: 0=Mon … 5=Sat 6=Sun  — convert to JS day (0=Sun)
            const jsDow = i === 6 ? 0 : i + 1;
            const isSat = jsDow === 6;
            const isSun = jsDow === 0;

            return (
              <button
                key={i}
                onClick={() => {
                  speak(`${d.getMonth() + 1}月${d.getDate()}日、${WEEKDAY_FULL[jsDow]}`);
                }}
                className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all active:scale-90"
                style={
                  isToday
                    ? { background: "rgba(139,92,246,0.6)", border: "1px solid rgba(139,92,246,0.8)" }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid transparent" }
                }
              >
                {/* Day name */}
                <span
                  className="text-[10px] font-black leading-none"
                  style={{
                    color: isToday ? "#fff" : isSat ? "#60a5fa" : isSun ? "#f87171" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {WEEKDAY_JP[jsDow]}
                </span>
                {/* Date number */}
                <span
                  className="text-sm font-black leading-none"
                  style={{ color: isToday ? "#fff" : "rgba(255,255,255,0.85)" }}
                >
                  {d.getDate()}
                </span>
                {/* Month label if 1st or Monday */}
                {d.getDate() === 1 && (
                  <span className="text-[8px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {d.getMonth() + 1}月
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
