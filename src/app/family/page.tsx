"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Types ─────────────────────────────────────────────────────────────────
interface RelCard {
  member: string;       // English label
  memberJP: string;     // Japanese label for this role
  emoji: string;
  callJP: string;       // What YOU SAY to their face (direct address)
  callRomaji: string;
  refJP: string;        // How YOU REFER TO THEM when talking to others
  refRomaji: string;
  color: string;
}

type PerspId = "child" | "father" | "mother" | "olderBro" | "olderSis" | "grandpa" | "grandma";

// ── Relationship data per perspective ─────────────────────────────────────
const RELS: Record<PerspId, RelCard[]> = {
  child: [
    { member: "Father",         memberJP: "お父さん",   emoji: "👨", callJP: "おとうさん",     callRomaji: "otousan",    refJP: "ちち",         refRomaji: "chichi",    color: "#3b82f6" },
    { member: "Mother",         memberJP: "お母さん",   emoji: "👩", callJP: "おかあさん",     callRomaji: "okaasan",    refJP: "はは",         refRomaji: "haha",      color: "#ec4899" },
    { member: "Older Brother",  memberJP: "お兄さん",   emoji: "👦", callJP: "おにいさん",     callRomaji: "oniisan",    refJP: "あに",         refRomaji: "ani",       color: "#22c55e" },
    { member: "Older Sister",   memberJP: "お姉さん",   emoji: "👧", callJP: "おねえさん",     callRomaji: "oneesan",    refJP: "あね",         refRomaji: "ane",       color: "#8b5cf6" },
    { member: "Younger Brother",memberJP: "弟",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "おとうと",     refRomaji: "otouto",    color: "#f97316" },
    { member: "Younger Sister", memberJP: "妹",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "いもうと",     refRomaji: "imouto",    color: "#f43f5e" },
    { member: "Grandfather",    memberJP: "お祖父さん", emoji: "👴", callJP: "おじいさん",     callRomaji: "ojiisan",    refJP: "そふ",         refRomaji: "sofu",      color: "#f59e0b" },
    { member: "Grandmother",    memberJP: "お祖母さん", emoji: "👵", callJP: "おばあさん",     callRomaji: "obaasan",    refJP: "そぼ",         refRomaji: "sobo",      color: "#14b8a6" },
    { member: "Uncle",          memberJP: "おじさん",   emoji: "🧔", callJP: "おじさん",       callRomaji: "ojisan",     refJP: "おじ",         refRomaji: "oji",       color: "#6366f1" },
    { member: "Aunt",           memberJP: "おばさん",   emoji: "👩", callJP: "おばさん",       callRomaji: "obasan",     refJP: "おば",         refRomaji: "oba",       color: "#a855f7" },
  ],
  father: [
    { member: "Wife",           memberJP: "妻",         emoji: "👩", callJP: "なまえ / ねえ",  callRomaji: "name / nee", refJP: "つま / かない",refRomaji: "tsuma",     color: "#ec4899" },
    { member: "Son",            memberJP: "息子",       emoji: "👦", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすこ",       refRomaji: "musuko",    color: "#3b82f6" },
    { member: "Daughter",       memberJP: "娘",         emoji: "👧", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすめ",       refRomaji: "musume",    color: "#f97316" },
    { member: "My Father",      memberJP: "父",         emoji: "👴", callJP: "おとうさん",     callRomaji: "otousan",    refJP: "ちち",         refRomaji: "chichi",    color: "#6366f1" },
    { member: "My Mother",      memberJP: "母",         emoji: "👵", callJP: "おかあさん",     callRomaji: "okaasan",    refJP: "はは",         refRomaji: "haha",      color: "#a855f7" },
    { member: "Older Brother",  memberJP: "兄",         emoji: "👨", callJP: "おにいさん",     callRomaji: "oniisan",    refJP: "あに",         refRomaji: "ani",       color: "#22c55e" },
    { member: "Older Sister",   memberJP: "姉",         emoji: "👩", callJP: "おねえさん",     callRomaji: "oneesan",    refJP: "あね",         refRomaji: "ane",       color: "#8b5cf6" },
    { member: "Younger Brother",memberJP: "弟",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "おとうと",     refRomaji: "otouto",    color: "#f59e0b" },
    { member: "Younger Sister", memberJP: "妹",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "いもうと",     refRomaji: "imouto",    color: "#14b8a6" },
  ],
  mother: [
    { member: "Husband",        memberJP: "夫",         emoji: "👨", callJP: "あなた / なまえ",callRomaji: "anata / name",refJP: "おっと / しゅじん",refRomaji: "otto",   color: "#3b82f6" },
    { member: "Son",            memberJP: "息子",       emoji: "👦", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすこ",       refRomaji: "musuko",    color: "#22c55e" },
    { member: "Daughter",       memberJP: "娘",         emoji: "👧", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすめ",       refRomaji: "musume",    color: "#f97316" },
    { member: "My Father",      memberJP: "父",         emoji: "👴", callJP: "おとうさん",     callRomaji: "otousan",    refJP: "ちち",         refRomaji: "chichi",    color: "#6366f1" },
    { member: "My Mother",      memberJP: "母",         emoji: "👵", callJP: "おかあさん",     callRomaji: "okaasan",    refJP: "はは",         refRomaji: "haha",      color: "#a855f7" },
    { member: "Older Brother",  memberJP: "兄",         emoji: "👨", callJP: "おにいさん",     callRomaji: "oniisan",    refJP: "あに",         refRomaji: "ani",       color: "#22c55e" },
    { member: "Older Sister",   memberJP: "姉",         emoji: "👩", callJP: "おねえさん",     callRomaji: "oneesan",    refJP: "あね",         refRomaji: "ane",       color: "#8b5cf6" },
    { member: "Younger Brother",memberJP: "弟",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "おとうと",     refRomaji: "otouto",    color: "#f59e0b" },
    { member: "Younger Sister", memberJP: "妹",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "いもうと",     refRomaji: "imouto",    color: "#14b8a6" },
  ],
  olderBro: [
    { member: "Father",         memberJP: "お父さん",   emoji: "👨", callJP: "おとうさん",     callRomaji: "otousan",    refJP: "ちち",         refRomaji: "chichi",    color: "#3b82f6" },
    { member: "Mother",         memberJP: "お母さん",   emoji: "👩", callJP: "おかあさん",     callRomaji: "okaasan",    refJP: "はは",         refRomaji: "haha",      color: "#ec4899" },
    { member: "Older Sister",   memberJP: "お姉さん",   emoji: "👧", callJP: "おねえさん",     callRomaji: "oneesan",    refJP: "あね",         refRomaji: "ane",       color: "#8b5cf6" },
    { member: "Younger Brother",memberJP: "弟",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "おとうと",     refRomaji: "otouto",    color: "#f97316" },
    { member: "Younger Sister", memberJP: "妹",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "いもうと",     refRomaji: "imouto",    color: "#f43f5e" },
    { member: "Grandfather",    memberJP: "お祖父さん", emoji: "👴", callJP: "おじいさん",     callRomaji: "ojiisan",    refJP: "そふ",         refRomaji: "sofu",      color: "#f59e0b" },
    { member: "Grandmother",    memberJP: "お祖母さん", emoji: "👵", callJP: "おばあさん",     callRomaji: "obaasan",    refJP: "そぼ",         refRomaji: "sobo",      color: "#14b8a6" },
  ],
  olderSis: [
    { member: "Father",         memberJP: "お父さん",   emoji: "👨", callJP: "おとうさん",     callRomaji: "otousan",    refJP: "ちち",         refRomaji: "chichi",    color: "#3b82f6" },
    { member: "Mother",         memberJP: "お母さん",   emoji: "👩", callJP: "おかあさん",     callRomaji: "okaasan",    refJP: "はは",         refRomaji: "haha",      color: "#ec4899" },
    { member: "Older Brother",  memberJP: "お兄さん",   emoji: "👦", callJP: "おにいさん",     callRomaji: "oniisan",    refJP: "あに",         refRomaji: "ani",       color: "#22c55e" },
    { member: "Younger Brother",memberJP: "弟",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "おとうと",     refRomaji: "otouto",    color: "#f97316" },
    { member: "Younger Sister", memberJP: "妹",         emoji: "🧒", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "いもうと",     refRomaji: "imouto",    color: "#f43f5e" },
    { member: "Grandfather",    memberJP: "お祖父さん", emoji: "👴", callJP: "おじいさん",     callRomaji: "ojiisan",    refJP: "そふ",         refRomaji: "sofu",      color: "#f59e0b" },
    { member: "Grandmother",    memberJP: "お祖母さん", emoji: "👵", callJP: "おばあさん",     callRomaji: "obaasan",    refJP: "そぼ",         refRomaji: "sobo",      color: "#14b8a6" },
  ],
  grandpa: [
    { member: "Wife",           memberJP: "妻",         emoji: "👵", callJP: "なまえ / おい",  callRomaji: "name",       refJP: "つま",         refRomaji: "tsuma",     color: "#ec4899" },
    { member: "Son",            memberJP: "息子",       emoji: "👨", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすこ",       refRomaji: "musuko",    color: "#3b82f6" },
    { member: "Daughter",       memberJP: "娘",         emoji: "👩", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすめ",       refRomaji: "musume",    color: "#f97316" },
    { member: "Grandson",       memberJP: "孫(男)",     emoji: "👦", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "まご",         refRomaji: "mago",      color: "#22c55e" },
    { member: "Granddaughter",  memberJP: "孫(女)",     emoji: "👧", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "まご",         refRomaji: "mago",      color: "#a855f7" },
    { member: "Son-in-law",     memberJP: "娘の夫",     emoji: "🧔", callJP: "なまえで / くん",callRomaji: "name / kun", refJP: "むこ",         refRomaji: "muko",      color: "#6366f1" },
    { member: "Daughter-in-law",memberJP: "息子の妻",   emoji: "👩", callJP: "なまえで / さん",callRomaji: "name / san", refJP: "よめ",         refRomaji: "yome",      color: "#14b8a6" },
  ],
  grandma: [
    { member: "Husband",        memberJP: "夫",         emoji: "👴", callJP: "あなた / なまえ",callRomaji: "anata",      refJP: "おっと",       refRomaji: "otto",      color: "#3b82f6" },
    { member: "Son",            memberJP: "息子",       emoji: "👨", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすこ",       refRomaji: "musuko",    color: "#22c55e" },
    { member: "Daughter",       memberJP: "娘",         emoji: "👩", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "むすめ",       refRomaji: "musume",    color: "#f97316" },
    { member: "Grandson",       memberJP: "孫(男)",     emoji: "👦", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "まご",         refRomaji: "mago",      color: "#3b82f6" },
    { member: "Granddaughter",  memberJP: "孫(女)",     emoji: "👧", callJP: "なまえで",       callRomaji: "(by name)",  refJP: "まご",         refRomaji: "mago",      color: "#ec4899" },
    { member: "Son-in-law",     memberJP: "娘の夫",     emoji: "🧔", callJP: "なまえで / くん",callRomaji: "name / kun", refJP: "むこ",         refRomaji: "muko",      color: "#6366f1" },
    { member: "Daughter-in-law",memberJP: "息子の妻",   emoji: "👩", callJP: "なまえで / さん",callRomaji: "name / san", refJP: "よめ",         refRomaji: "yome",      color: "#14b8a6" },
  ],
};

// ── Perspective selector data ─────────────────────────────────────────────
const PERSPECTIVES = [
  { id: "child"    as PerspId, label: "こども",   english: "Child",         emoji: "🧒", color: "#f97316" },
  { id: "father"   as PerspId, label: "ちち",     english: "Father",        emoji: "👨", color: "#3b82f6" },
  { id: "mother"   as PerspId, label: "はは",     english: "Mother",        emoji: "👩", color: "#ec4899" },
  { id: "olderBro" as PerspId, label: "あに",     english: "Older Brother", emoji: "👦", color: "#22c55e" },
  { id: "olderSis" as PerspId, label: "あね",     english: "Older Sister",  emoji: "👧", color: "#8b5cf6" },
  { id: "grandpa"  as PerspId, label: "そふ",     english: "Grandfather",   emoji: "👴", color: "#f59e0b" },
  { id: "grandma"  as PerspId, label: "そぼ",     english: "Grandmother",   emoji: "👵", color: "#14b8a6" },
];

// ── Family tree visual ────────────────────────────────────────────────────
function FamilyTree({ selected }: { selected: PerspId }) {
  const node = (id: PerspId, emoji: string, jp: string) => {
    const isMe = id === selected;
    return (
      <div
        className="flex flex-col items-center gap-0.5"
        style={{ opacity: isMe ? 1 : 0.5 }}
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all"
          style={isMe
            ? { backgroundColor: PERSPECTIVES.find(p => p.id === id)?.color ?? "#6366f1", boxShadow: `0 4px 12px ${PERSPECTIVES.find(p => p.id === id)?.color ?? "#6366f1"}55`, transform: "scale(1.15)" }
            : { backgroundColor: "#f1f5f9" }
          }
        >
          {emoji}
        </div>
        <span className="text-[9px] font-black text-gray-500">{jp}</span>
        {isMe && <span className="text-[8px] font-black text-orange-500">わたし</span>}
      </div>
    );
  };

  return (
    <div className="bg-white/80 rounded-3xl border border-gray-100 px-4 py-4 mb-5">
      {/* Grandparent row */}
      <div className="flex justify-center gap-6 mb-2">
        {node("grandpa", "👴", "そふ")}
        {node("grandma", "👵", "そぼ")}
      </div>
      {/* Connector line */}
      <div className="flex justify-center mb-1">
        <div className="w-px h-4 bg-gray-200" />
      </div>
      {/* Parents row */}
      <div className="flex justify-center gap-6 mb-2">
        {node("father", "👨", "ちち")}
        {node("mother", "👩", "はは")}
      </div>
      {/* Connector line */}
      <div className="flex justify-center mb-1">
        <div className="w-px h-4 bg-gray-200" />
      </div>
      {/* Children row */}
      <div className="flex justify-center gap-4 mb-0">
        {node("olderBro", "👦", "あに")}
        {node("olderSis", "👧", "あね")}
        {node("child",    "🧒", "こども")}
      </div>
    </div>
  );
}

// ── Relationship card ─────────────────────────────────────────────────────
function RelCardView({ card, onTap, active }: { card: RelCard; onTap: () => void; active: boolean }) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-3xl border-2 transition-all active:scale-[0.98] overflow-hidden"
      style={{
        borderColor: active ? card.color : "#f1f5f9",
        backgroundColor: active ? `${card.color}10` : "#fff",
        boxShadow: active ? `0 4px 16px ${card.color}33` : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-stretch">
        {/* Color bar + emoji */}
        <div
          className="flex flex-col items-center justify-center px-4 py-4 gap-1 flex-shrink-0"
          style={{ backgroundColor: active ? card.color : `${card.color}15`, minWidth: 72 }}
        >
          <span className="text-3xl">{card.emoji}</span>
          <span
            className="text-[10px] font-black"
            style={{ color: active ? "#fff" : card.color }}
          >
            {card.memberJP}
          </span>
          <span className="text-[9px] text-gray-400 font-bold">{card.member}</span>
        </div>

        {/* Info */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-center gap-2">
          {/* Direct address */}
          <div>
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-wide">
              呼びかけ · Direct address
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-gray-800">{card.callJP}</span>
              <span className="text-xs text-gray-400 font-bold italic">{card.callRomaji}</span>
            </div>
          </div>
          {/* Reference term */}
          <div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wide">
              言い方 · When talking about them
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-black" style={{ color: card.color }}>{card.refJP}</span>
              <span className="text-xs text-gray-400 font-bold italic">{card.refRomaji}</span>
            </div>
          </div>
        </div>

        {/* Speaker indicator */}
        {active && (
          <div className="flex items-center pr-4">
            <span className="text-xl animate-bounce">🔊</span>
          </div>
        )}
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function FamilyPage() {
  const [perspId, setPerspId] = useState<PerspId>("child");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const { speak } = useSpeech();

  const persp = PERSPECTIVES.find(p => p.id === perspId)!;
  const cards = RELS[perspId];

  const tap = (card: RelCard) => {
    speak(card.callJP.split(" / ")[0]); // speak the first option
    setActiveCard(card.member);
    setTimeout(() => setActiveCard(null), 1800);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-black text-gray-800">👨‍👩‍👧‍👦 かぞく</h1>
        <p className="text-sm text-gray-400">わたしは だれ？ — Who am I?</p>
      </div>

      {/* "I am" selector */}
      <div className="mb-4">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">わたしは…</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {PERSPECTIVES.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPerspId(p.id); setActiveCard(null); }}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all active:scale-95"
              style={perspId === p.id
                ? { backgroundColor: p.color, color: "#fff", boxShadow: `0 4px 12px ${p.color}55` }
                : { backgroundColor: "#f3f4f6", color: "#6b7280" }
              }
            >
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-xs font-black">{p.label}</span>
              <span className="text-[9px] font-bold opacity-70">{p.english}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Family tree visual */}
      <FamilyTree selected={perspId} />

      {/* Current perspective badge */}
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
        style={{ backgroundColor: `${persp.color}15`, border: `2px solid ${persp.color}33` }}
      >
        <span className="text-3xl">{persp.emoji}</span>
        <div>
          <p className="font-black text-gray-800">
            わたしは <span style={{ color: persp.color }}>{persp.label}</span> です
          </p>
          <p className="text-xs text-gray-400 font-bold">I am the {persp.english} — tap each card to hear how to call them</p>
        </div>
      </div>

      {/* Relationship cards */}
      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <RelCardView
            key={card.member}
            card={card}
            onTap={() => tap(card)}
            active={activeCard === card.member}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 flex flex-col gap-1.5">
        <p className="text-xs font-black text-gray-500 mb-1">📖 How to read the cards</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-orange-400 uppercase">呼びかけ</span>
          <span className="text-xs text-gray-500">= What you SAY directly to their face</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-blue-400 uppercase">言い方</span>
          <span className="text-xs text-gray-500">= How you REFER TO THEM when talking to others</span>
        </div>
      </div>
    </div>
  );
}
