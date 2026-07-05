"use client";

import Link from "next/link";
import HomeDateWidget from "@/components/HomeDateWidget";

const APPS = [
  // Row 1 — core learning
  { href: "/exam",       icon: "📝", label: "Exam",        color: "#f97316", bg: "from-orange-500 to-rose-500" },
  { href: "/flashcards", icon: "🃏", label: "Flashcards",  color: "#ec4899", bg: "from-pink-400 to-rose-500" },
  { href: "/alphabet",   icon: "あ", label: "Alphabet",    color: "#f97316", bg: "from-orange-400 to-amber-500" },
  { href: "/writing",    icon: "✍️", label: "Writing",     color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/games",      icon: "🎮", label: "Games",       color: "#14b8a6", bg: "from-teal-400 to-green-500" },
  { href: "/game",       icon: "🔍", label: "Find Letter", color: "#22c55e", bg: "from-green-400 to-emerald-500" },
  // Row 2 — vocabulary
  { href: "/animals",    icon: "🐾", label: "Animals",     color: "#f59e0b", bg: "from-amber-400 to-yellow-500" },
  { href: "/body",       icon: "🧑", label: "Body",        color: "#06b6d4", bg: "from-cyan-400 to-sky-500" },
  { href: "/home",       icon: "🏠", label: "Home",        color: "#10b981", bg: "from-emerald-400 to-teal-500" },
  { href: "/colors",     icon: "🎨", label: "Colors",      color: "#a855f7", bg: "from-purple-400 to-fuchsia-500" },
  // Row 3 — topics
  { href: "/directions", icon: "🧭", label: "Directions",  color: "#3b82f6", bg: "from-blue-400 to-indigo-500" },
  { href: "/left-right", icon: "👈", label: "Left/Right",  color: "#0ea5e9", bg: "from-sky-400 to-green-400" },
  { href: "/family",     icon: "👨‍👩‍👧", label: "Family",    color: "#f43f5e", bg: "from-rose-400 to-pink-500" },
  { href: "/clock",      icon: "🕐", label: "Clock",       color: "#6366f1", bg: "from-indigo-400 to-violet-500" },
  { href: "/math",       icon: "🧮", label: "Math",        color: "#14b8a6", bg: "from-teal-400 to-cyan-500" },
  // Row 4 — themes & library
  { href: "/themes",     icon: "🗂️", label: "Themes",      color: "#f97316", bg: "from-orange-400 to-red-400" },
  { href: "/books",      icon: "📖", label: "Books",       color: "#0ea5e9", bg: "from-sky-400 to-blue-500" },
  { href: "/conversations",icon:"💬", label: "会話",       color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/dictionary", icon: "📝", label: "Dictionary",  color: "#ec4899", bg: "from-pink-400 to-fuchsia-500" },
  // Row 5 — creative
  { href: "/words",      icon: "🔤", label: "Words",       color: "#f59e0b", bg: "from-yellow-400 to-orange-500" },
  { href: "/draw",       icon: "🎨", label: "Draw",        color: "#a855f7", bg: "from-fuchsia-400 to-purple-600" },
  // Row 6 — sports & food
  { href: "/food",       icon: "🍽️", label: "Food",        color: "#f97316", bg: "from-orange-400 to-yellow-400" },
  { href: "/badminton",  icon: "🏸", label: "Badminton",   color: "#3b82f6", bg: "from-blue-400 to-cyan-500" },
  { href: "/swimming",   icon: "🏊", label: "Swimming",    color: "#06b6d4", bg: "from-cyan-400 to-blue-500" },
  { href: "/volleyball",    icon: "🏐", label: "Volleyball",  color: "#f59e0b", bg: "from-yellow-400 to-orange-400" },
  // Row 7 — English
  { href: "/english",       icon: "🇬🇧", label: "English",    color: "#6366f1", bg: "from-indigo-400 to-blue-500" },
  { href: "/words-english", icon: "⌨️",  label: "Words EN",   color: "#8b5cf6", bg: "from-violet-400 to-indigo-500" },
];


export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col pb-28"
      style={{
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
      }}
    >

      {/* ── Date / Week widget ── */}
      <div className="px-5 pt-3 mb-4 max-w-xl mx-auto w-full">
        <HomeDateWidget />
      </div>

      {/* ── App grid ── */}
      <div className="flex-1 px-5">
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 max-w-xl mx-auto">
          {APPS.map((app) => (
            <AppIcon key={app.href} {...app} />
          ))}
        </div>
      </div>

    </div>
  );
}

function AppIcon({ href, icon, label, bg }: {
  href: string; icon: string; label: string; color: string; bg: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 active:scale-90 transition-transform group"
    >
      {/* Icon box — iPad style rounded square */}
      <div
        className={`w-16 h-16 rounded-[22px] bg-gradient-to-br ${bg} flex items-center justify-center text-3xl shadow-lg group-active:brightness-90`}
        style={{
          boxShadow: "0 4px 15px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        <span className="drop-shadow-md leading-none">{icon}</span>
      </div>
      {/* Label */}
      <span
        className="text-white text-[11px] font-bold text-center leading-tight"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
      >
        {label}
      </span>
    </Link>
  );
}
