"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSpeech } from "@/hooks/useSpeech";
import { buildScatterLayout } from "@/lib/scatterLayout";

export interface ClubWordItem {
  _id: string;
  japanese: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  imageUrl?: string;
  audioUrl?: string;
  example_sentence?: string;
  example_sentence_reading?: string;
}

export interface ClubSentenceItem {
  _id: string;
  japanese: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  imageUrl?: string;
}

export interface ClubCategoryItem {
  _id: string;
  kind: "conversation" | "sentence";
  title: string;
  titleJapanese?: string;
  description?: string;
  coverImageUrl?: string;
  words: ClubWordItem[];
  sentences: ClubSentenceItem[];
}

export interface UnifiedCard {
  id: string;
  cardType: "word" | "sentence";
  japanese: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  imageUrl?: string;
  audioUrl?: string;
  example_sentence?: string;
  example_sentence_reading?: string;
  relatedSentences: ClubSentenceItem[];
}

const SLICE_COLORS = [
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

const SENSEI_PROMPTS = [
  {
    ja: "これは なんですか？",
    romaji: "Kore wa nan desu ka?",
    mn: "Энэ юу вэ?",
    icon: "❓",
  },
  {
    ja: "にほんごで なんといいますか？",
    romaji: "Nihongo de nan to iimasu ka?",
    mn: "Японоор юу гэдэг вэ?",
    icon: "🗣️",
  },
  {
    ja: "どういう いみですか？",
    romaji: "Dou iu imi desu ka?",
    mn: "Ямар утгатай вэ?",
    icon: "💭",
  },
  {
    ja: "れいぶんを いってみよう！",
    romaji: "Reibun wo itte miyou!",
    mn: "Жишээ өгүүлбэр хэлээрэй!",
    icon: "📖",
  },
  {
    ja: "せいかい！よくできました！",
    romaji: "Seikai! Yoku dekimashita!",
    mn: "Зөв байна! Мундаг!",
    icon: "👏",
  },
];

const STORAGE_KEY = "japanese-club-participants";
const SCATTER_PAGE_SIZE = 12;

export default function JapaneseClubClient({
  conversationCategories,
  sentenceTopics,
}: {
  conversationCategories: ClubCategoryItem[];
  sentenceTopics: ClubCategoryItem[];
}) {
  const { speak } = useSpeech();

  // ── Phase & Sensei spinner state ──────────────────────────────────────────
  const [phase, setPhase] = useState<"setup" | "club">("setup");
  const [participants, setParticipants] = useState<string[]>(["Аав", "Ээж", "Хүүхэд"]);
  const [nameInput, setNameInput] = useState("");
  const [sensei, setSensei] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});

  // Arrow rotation angle in degrees (0 deg = pointing up / 12 o'clock)
  const [arrowAngle, setArrowAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Load saved participant names from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setParticipants(parsed);
        }
      }
    } catch {}
  }, []);

  const updateParticipants = (next: string[]) => {
    setParticipants(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleAddParticipant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (!participants.includes(trimmed)) {
      updateParticipants([...participants, trimmed]);
    }
    setNameInput("");
  };

  const handleRemoveParticipant = (name: string) => {
    const next = participants.filter((p) => p !== name);
    updateParticipants(next);
    if (sensei === name) setSensei(null);
    if (currentStudent === name) setCurrentStudent(null);
  };

  const spinForSensei = () => {
    if (spinning || participants.length === 0) return;
    setSpinning(true);
    setSensei(null);

    const n = participants.length;
    const winnerIndex = Math.floor(Math.random() * n);
    const sliceDeg = 360 / n;
    // Center angle of winnerIndex slice (measured clockwise from 12 o'clock)
    const targetSliceCenter = winnerIndex * sliceDeg + sliceDeg / 2;
    // Add jitter within the slice so it feels natural
    const jitter = (Math.random() - 0.5) * sliceDeg * 0.5;
    const desiredMod = (targetSliceCenter + jitter + 360) % 360;

    const currentMod = ((arrowAngle % 360) + 360) % 360;
    let delta = desiredMod - currentMod;
    if (delta <= 0) delta += 360;
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const nextAngle = arrowAngle + extraSpins + delta;

    setArrowAngle(nextAngle);

    setTimeout(() => {
      const chosen = participants[winnerIndex];
      setSensei(chosen);
      setSpinning(false);
      const others = participants.filter((p) => p !== chosen);
      setCurrentStudent(others[0] ?? null);
      speak(`${chosen} せんせい！`);
    }, 3200);
  };

  const students = useMemo(
    () => participants.filter((p) => p !== sensei),
    [participants, sensei]
  );

  const pickRandomStudent = () => {
    if (students.length === 0) return;
    const picked = students[Math.floor(Math.random() * students.length)];
    setCurrentStudent(picked);
    speak(`${picked} さん、こたえてください`);
  };

  const awardPoint = (name: string) => {
    setScores((prev) => ({ ...prev, [name]: (prev[name] ?? 0) + 1 }));
    speak("せいかい！よくできました！");
  };

  // ── Sidebar & Topic / Category Selection ──────────────────────────────────
  const allCategories = useMemo(
    () => [...conversationCategories, ...sentenceTopics],
    [conversationCategories, sentenceTopics]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    () => allCategories[0]?._id ?? ""
  );
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // View options for the cards
  const [boardLayout, setBoardLayout] = useState<"cards" | "scatter">("cards");
  const [contentFilter, setContentFilter] = useState<"all" | "words" | "sentences">("all");
  const [hideAnswers, setHideAnswers] = useState(false);
  const [selectedCard, setSelectedCard] = useState<UnifiedCard | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [scatterPage, setScatterPage] = useState(0);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCategory = useMemo(
    () => allCategories.find((c) => c._id === selectedCategoryId) ?? allCategories[0] ?? null,
    [allCategories, selectedCategoryId]
  );

  // Pool of all sentences across all topics so word cards can show matching example sentences
  const allSentencesPool = useMemo(() => {
    const list: ClubSentenceItem[] = [];
    for (const st of sentenceTopics) {
      list.push(...st.sentences);
    }
    for (const cc of conversationCategories) {
      list.push(...cc.sentences);
    }
    return list;
  }, [sentenceTopics, conversationCategories]);

  // Unified cards for the active category
  const activeCards = useMemo<UnifiedCard[]>(() => {
    if (!activeCategory) return [];
    const cards: UnifiedCard[] = [];

    if (contentFilter === "all" || contentFilter === "words") {
      for (const w of activeCategory.words) {
        const related = allSentencesPool.filter(
          (s) =>
            (w.japanese && s.japanese.includes(w.japanese)) ||
            (w.hiragana && s.japanese.includes(w.hiragana))
        );
        cards.push({
          id: `word-${w._id}`,
          cardType: "word",
          japanese: w.japanese,
          hiragana: w.hiragana,
          romaji: w.romaji,
          english_meaning: w.english_meaning,
          mongolian_meaning: w.mongolian_meaning,
          imageUrl: w.imageUrl,
          audioUrl: w.audioUrl,
          example_sentence: w.example_sentence,
          example_sentence_reading: w.example_sentence_reading,
          relatedSentences: related.slice(0, 3),
        });
      }
    }

    if (contentFilter === "all" || contentFilter === "sentences") {
      for (const s of activeCategory.sentences) {
        cards.push({
          id: `sent-${s._id}`,
          cardType: "sentence",
          japanese: s.japanese,
          romaji: s.romaji,
          english_meaning: s.english_meaning,
          mongolian_meaning: s.mongolian_meaning,
          imageUrl: s.imageUrl,
          relatedSentences: [],
        });
      }
    }

    return cards;
  }, [activeCategory, contentFilter, allSentencesPool]);

  // Scatter pages (12 per page, just like Family Talk VocabularyBoard)
  const scatterPages = useMemo(() => {
    const count = Math.max(1, Math.ceil(activeCards.length / SCATTER_PAGE_SIZE));
    return Array.from({ length: count }, (_, i) =>
      activeCards.slice(i * SCATTER_PAGE_SIZE, (i + 1) * SCATTER_PAGE_SIZE)
    );
  }, [activeCards]);

  const scatterLayouts = useMemo(
    () => scatterPages.map((pageCards) => buildScatterLayout(pageCards.length)),
    [scatterPages]
  );

  const handleCardSelect = (card: UnifiedCard) => {
    speak(card.japanese, card.audioUrl);
    setPlayingId(card.id);
    setSelectedCard(card);
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.add(card.id);
      return next;
    });
    if (playTimer.current) clearTimeout(playTimer.current);
    playTimer.current = setTimeout(() => setPlayingId(null), 2200);
  };

  const selectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setContentFilter("all");
    setSelectedCard(null);
    setScatterPage(0);
    setMobileSidebarOpen(false);
  };

  const filteredConversations = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return conversationCategories;
    return conversationCategories.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.titleJapanese ?? "").toLowerCase().includes(q)
    );
  }, [conversationCategories, sidebarSearch]);

  const filteredSentences = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    if (!q) return sentenceTopics;
    return sentenceTopics.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.titleJapanese ?? "").toLowerCase().includes(q)
    );
  }, [sentenceTopics, sidebarSearch]);

  // Navigate prev/next inside modal
  const selectedCardIndex = selectedCard
    ? activeCards.findIndex((c) => c.id === selectedCard.id)
    : -1;

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1: SENSEI SELECTION & SPINNING ARROW
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === "setup") {
    const n = Math.max(1, participants.length);
    const sliceDeg = 360 / n;

    return (
      <div
        className="min-h-screen flex flex-col text-white"
        style={{
          background: "linear-gradient(155deg, #1a103c 0%, #2d1b4e 45%, #0f172a 100%)",
        }}
      >
        {/* Top bar */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/category/play"
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition-all active:scale-90"
            >
              ←
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <span>🎌</span> Japanese Club
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Эхлээд оролцох хүмүүсийн нэрийг оруулаад сум эргүүлж Sensei (Багш)-ээ сонгоорой!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!sensei && participants.length > 0) setSensei(participants[0]);
              setPhase("club");
            }}
            className="text-xs sm:text-sm font-black px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 transition-all active:scale-95"
          >
            Алгасах · Шууд орох →
          </button>
        </div>

        {/* Main setup grid */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Left: Participant input & list */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>👥</span> 1. Оролцогчдын нэрс оруулах
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                Тоглоомд оролцох гэр бүлийн гишүүд болон найзуудынхаа нэрийг нэмнэ үү
              </p>
            </div>

            <form onSubmit={handleAddParticipant} className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Нэр бичих (жнь: Болд, Ану)..."
                className="flex-1 rounded-2xl bg-white/10 border-2 border-white/20 focus:border-pink-400 px-4 py-2.5 text-sm font-bold text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 font-black text-sm shadow-lg active:scale-95 transition-all"
              >
                + Нэмэх
              </button>
            </form>

            {/* Participant chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/60 font-bold">
                <span>Оролцогчид ({participants.length})</span>
                {participants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => updateParticipants([])}
                    className="text-rose-300 hover:text-rose-200 underline"
                  >
                    Бүгдийг арилгах
                  </button>
                )}
              </div>

              {participants.length === 0 ? (
                <div className="py-8 text-center text-white/40 border-2 border-dashed border-white/15 rounded-2xl text-sm font-bold">
                  Оролцогчийн нэр нэмнэ үү 👆
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {participants.map((name, i) => {
                    const color = SLICE_COLORS[i % SLICE_COLORS.length];
                    const isPickedSensei = sensei === name;
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-2xl font-black text-sm shadow-md transition-transform"
                        style={{
                          backgroundColor: color,
                          transform: isPickedSensei ? "scale(1.08)" : undefined,
                          boxShadow: isPickedSensei ? "0 0 0 3px #fde047" : undefined,
                        }}
                      >
                        <span>
                          {isPickedSensei ? "👨‍🏫 " : ""}
                          {name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(name)}
                          className="w-5 h-5 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center text-xs"
                          aria-label={`Remove ${name}`}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Result announcement box */}
            {sensei && !spinning && (
              <div className="rounded-3xl bg-gradient-to-r from-amber-400/20 via-pink-500/20 to-purple-500/20 border-2 border-amber-300/60 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-gray-900 flex items-center justify-center text-2xl font-black shadow-lg">
                    👨‍🏫
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Sensei (Багш) сонгогдлоо!
                    </p>
                    <p className="text-2xl font-black text-white">
                      {sensei} 先生 (Sensei) 🎉
                    </p>
                  </div>
                </div>
                {students.length > 0 && (
                  <p className="text-xs text-white/80 font-bold">
                    🙋 Асуултанд хариулах гишүүд:{" "}
                    <span className="text-pink-300">{students.join(", ")}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setPhase("club")}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-gray-900 font-black text-base shadow-xl active:scale-95 transition-all"
                >
                  🎌 Japanese Club эхлэх →
                </button>
              </div>
            )}
          </div>

          {/* Right: Circular wheel with Spinning Arrow */}
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-8 border-white/15 shadow-2xl" />

              {/* SVG Wheel of participant slices */}
              <svg
                viewBox="-110 -110 220 220"
                className="w-full h-full drop-shadow-2xl"
              >
                {participants.length === 0 ? (
                  <circle cx="0" cy="0" r="100" fill="#334155" />
                ) : participants.length === 1 ? (
                  <g>
                    <circle cx="0" cy="0" r="100" fill={SLICE_COLORS[0]} />
                    <text
                      x="0"
                      y="-45"
                      textAnchor="middle"
                      fill="#fff"
                      fontWeight="900"
                      fontSize="14"
                    >
                      {participants[0]}
                    </text>
                  </g>
                ) : (
                  participants.map((name, i) => {
                    const startDeg = i * sliceDeg - 90;
                    const endDeg = (i + 1) * sliceDeg - 90;
                    const startRad = (startDeg * Math.PI) / 180;
                    const endRad = (endDeg * Math.PI) / 180;
                    const r = 102;
                    const x1 = r * Math.cos(startRad);
                    const y1 = r * Math.sin(startRad);
                    const x2 = r * Math.cos(endRad);
                    const y2 = r * Math.sin(endRad);
                    const largeArc = sliceDeg > 180 ? 1 : 0;
                    const d = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    // Label position
                    const midDeg = startDeg + sliceDeg / 2;
                    const midRad = (midDeg * Math.PI) / 180;
                    const labelR = 64;
                    const lx = labelR * Math.cos(midRad);
                    const ly = labelR * Math.sin(midRad);
                    const isWinner = sensei === name && !spinning;

                    return (
                      <g key={name}>
                        <path
                          d={d}
                          fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                          stroke="#1e1b4b"
                          strokeWidth="2"
                          opacity={sensei && !spinning && !isWinner ? 0.55 : 1}
                        />
                        <text
                          x={lx}
                          y={ly}
                          fill="#ffffff"
                          fontWeight="900"
                          fontSize={participants.length > 6 ? "9" : "11"}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                        >
                          {name.length > 9 ? name.slice(0, 8) + "…" : name}
                        </text>
                      </g>
                    );
                  })
                )}

                {/* Spinning Arrow in the center */}
                <g
                  style={{
                    transform: `rotate(${arrowAngle}deg)`,
                    transition: spinning
                      ? "transform 3.2s cubic-bezier(0.12, 0.8, 0.18, 1)"
                      : "none",
                  }}
                >
                  {/* Arrow shadow / shaft pointing straight UP (0 deg = 12 o'clock) */}
                  <polygon
                    points="0,-82 -11,-46 -5,-46 -5,26 5,26 5,-46 11,-46"
                    fill="#fde047"
                    stroke="#1e1b4b"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Center knob */}
                <circle
                  cx="0"
                  cy="0"
                  r="16"
                  fill="#ffffff"
                  stroke="#1e1b4b"
                  strokeWidth="4"
                />
                <circle cx="0" cy="0" r="6" fill="#f43f5e" />
              </svg>
            </div>

            <button
              type="button"
              onClick={spinForSensei}
              disabled={spinning || participants.length === 0}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-500 hover:to-pink-600 disabled:opacity-40 text-white font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center gap-3"
            >
              <span className={spinning ? "animate-spin" : ""}>🏹</span>
              <span>
                {spinning
                  ? "Сум эргэлдэж байна..."
                  : sensei
                  ? "Дахин эргүүлэх"
                  : "Сум эргүүлж Sensei сонгох!"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2: JAPANESE CLUB WORKSPACE (SIDEBAR + CARDS + SENSEI Q&A)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden text-white"
      style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 45%, #0f766e 100%)",
      }}
    >
      {/* ── Top Header: Sensei Role & Question Bar ── */}
      <header className="flex-shrink-0 bg-slate-950/70 backdrop-blur-md border-b border-white/10 px-3 sm:px-5 py-2.5 z-20 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Back + Title + Mobile sidebar button */}
          <div className="flex items-center gap-2">
            <Link
              href="/category/play"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-all active:scale-90"
              title="Back"
            >
              ←
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden px-3 py-1.5 rounded-xl bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-black flex items-center gap-1.5"
            >
              <span>📂</span> Сэдвүүд
            </button>
            <h1 className="text-base sm:text-xl font-black flex items-center gap-1.5">
              <span>🎌</span>
              <span>Japanese Club</span>
            </h1>
          </div>

          {/* Center: Sensei + Students status */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-2xl">
              <span className="text-base">👨‍🏫</span>
              <span className="text-xs font-bold text-amber-200">Sensei:</span>
              <span className="text-sm font-black text-white">
                {sensei ?? "Сонгоогүй"}
              </span>
              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="ml-1 text-[11px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg hover:bg-amber-300 transition-colors"
              >
                🔄 Эргүүлэх
              </button>
            </div>

            {students.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={pickRandomStudent}
                  className="text-xs font-black bg-purple-500 hover:bg-purple-600 text-white px-2.5 py-1 rounded-xl shadow active:scale-95 transition-all"
                  title="Санамсаргүй сурагч сонгож асуух"
                >
                  🎲 Хэнээс асуух вэ?
                </button>
                {students.map((st) => {
                  const isActiveStudent = currentStudent === st;
                  const pts = scores[st] ?? 0;
                  return (
                    <div
                      key={st}
                      onClick={() => setCurrentStudent(st)}
                      className={`cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                        isActiveStudent
                          ? "bg-pink-500 text-white ring-2 ring-yellow-300 scale-105"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      <span>{isActiveStudent ? "🎯" : "🙋"}</span>
                      <span>{st}</span>
                      {pts > 0 && (
                        <span className="text-amber-300 ml-0.5">⭐{pts}</span>
                      )}
                      {isActiveStudent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            awardPoint(st);
                          }}
                          className="ml-1 bg-yellow-300 text-slate-900 px-1.5 py-0.2 rounded-md text-[10px] font-black hover:bg-yellow-200"
                          title="Зөв хариулсан тул +1 од өгөх"
                        >
                          +1⭐
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Board Layout & Answer Hide Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setHideAnswers(!hideAnswers)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${
                hideAnswers
                  ? "bg-rose-500 border-rose-300 text-white"
                  : "bg-white/10 border-white/15 text-white/80 hover:bg-white/20"
              }`}
              title="Асуулт асуух үед хариултыг нуух / ил харуулах"
            >
              {hideAnswers ? "🙈 Хариулт нуусан" : "👁 Хариулт ил"}
            </button>

            <div className="flex bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setBoardLayout("cards")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                  boardLayout === "cards"
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🃏 Карт
              </button>
              <button
                type="button"
                onClick={() => setBoardLayout("scatter")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors ${
                  boardLayout === "scatter"
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:text-white"
                }`}
              >
                ✨ Тархсан
              </button>
            </div>
          </div>
        </div>

        {/* Sensei Question Prompts Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[11px] font-black text-amber-300 flex-shrink-0">
            👨‍🏫 Sensei асуулт:
          </span>
          {SENSEI_PROMPTS.map((p) => (
            <button
              key={p.ja}
              type="button"
              onClick={() => speak(p.ja)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs transition-all active:scale-95"
              title={`${p.romaji} — ${p.mn}`}
            >
              <span>{p.icon}</span>
              <span className="font-black text-white">{p.ja}</span>
              <span className="text-white/60 text-[10px] hidden sm:inline">
                ({p.mn})
              </span>
              <span className="text-[10px]">🔊</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Body: Sidebar + Main Content ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar: Conversation Categories & Sentence Topics ── */}
        <aside
          className={`w-72 sm:w-80 flex-shrink-0 bg-slate-950/85 backdrop-blur-xl border-r border-white/10 flex flex-col z-40 transition-transform duration-200 ${
            mobileSidebarOpen
              ? "fixed inset-y-0 left-0 translate-x-0"
              : "hidden md:flex"
          }`}
        >
          {/* Sidebar search */}
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <span className="text-white/50 text-sm">🔍</span>
              <input
                type="search"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Сэдэв хайх / Search topic..."
                className="flex-1 bg-transparent text-xs font-bold text-white placeholder-white/40 outline-none"
              />
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch("")}
                  className="text-white/50 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {/* Section 1: Conversation Categories */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                  <span>💬</span> Conversation Categories
                </h2>
                <span className="text-[10px] font-bold bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded-full">
                  {filteredConversations.length}
                </span>
              </div>

              {filteredConversations.length === 0 ? (
                <p className="text-xs text-white/40 px-2 py-2">
                  Ярианы сэдэв олдсонгүй
                </p>
              ) : (
                <div className="space-y-1.5">
                  {filteredConversations.map((cat) => {
                    const isSelected = activeCategory?._id === cat._id;
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => selectCategory(cat._id)}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl transition-all active:scale-95 ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                            : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                          {cat.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.coverImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">💬</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">
                            {cat.title}
                          </p>
                          {cat.titleJapanese && (
                            <p
                              className={`text-xs truncate ${
                                isSelected ? "text-white/90" : "text-white/50"
                              }`}
                            >
                              {cat.titleJapanese}
                            </p>
                          )}
                          <p
                            className={`text-[10px] font-bold mt-0.5 ${
                              isSelected ? "text-white/90" : "text-white/40"
                            }`}
                          >
                            {cat.words.length > 0 && `${cat.words.length} үг`}
                            {cat.words.length > 0 &&
                              cat.sentences.length > 0 &&
                              " · "}
                            {cat.sentences.length > 0 &&
                              `${cat.sentences.length} өгүүлбэр`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Sentence Topics */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <span>🗣️</span> Sentence Topics
                </h2>
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full">
                  {filteredSentences.length}
                </span>
              </div>

              {filteredSentences.length === 0 ? (
                <p className="text-xs text-white/40 px-2 py-2">
                  Өгүүлбэрийн сэдэв олдсонгүй
                </p>
              ) : (
                <div className="space-y-1.5">
                  {filteredSentences.map((top) => {
                    const isSelected = activeCategory?._id === top._id;
                    return (
                      <button
                        key={top._id}
                        type="button"
                        onClick={() => selectCategory(top._id)}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-2xl transition-all active:scale-95 ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                            : "bg-white/5 hover:bg-white/10 text-white/80"
                        }`}
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                          {top.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={top.coverImageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">🗣️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate">
                            {top.title}
                          </p>
                          {top.titleJapanese && (
                            <p
                              className={`text-xs truncate ${
                                isSelected ? "text-white/90" : "text-white/50"
                              }`}
                            >
                              {top.titleJapanese}
                            </p>
                          )}
                          <p
                            className={`text-[10px] font-bold mt-0.5 ${
                              isSelected ? "text-white/90" : "text-white/40"
                            }`}
                          >
                            {top.sentences.length} өгүүлбэр
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main Content Area: Selected Category/Topic Cards ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeCategory ? (
            <>
              {/* Category Header Bar */}
              <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl">
                    {activeCategory.kind === "conversation" ? "💬" : "🗣️"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-white truncate">
                        {activeCategory.title}
                      </h2>
                      {activeCategory.titleJapanese && (
                        <span className="text-xs font-bold text-pink-300 truncate">
                          ({activeCategory.titleJapanese})
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/60">
                      Карт дээр дарж дуудлагыг сонсох болон хариулт, жишээ өгүүлбэрүүдийг харна уу
                    </p>
                  </div>
                </div>

                {/* Filter tabs if category has both words and sentences */}
                <div className="flex items-center gap-1.5">
                  {activeCategory.words.length > 0 &&
                    activeCategory.sentences.length > 0 && (
                      <div className="flex bg-white/10 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => setContentFilter("all")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            contentFilter === "all"
                              ? "bg-pink-500 text-white"
                              : "text-white/70"
                          }`}
                        >
                          Бүгд ({activeCategory.words.length + activeCategory.sentences.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentFilter("words")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            contentFilter === "words"
                              ? "bg-pink-500 text-white"
                              : "text-white/70"
                          }`}
                        >
                          🔤 Үгс ({activeCategory.words.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentFilter("sentences")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            contentFilter === "sentences"
                              ? "bg-pink-500 text-white"
                              : "text-white/70"
                          }`}
                        >
                          🗣️ Өгүүлбэр ({activeCategory.sentences.length})
                        </button>
                      </div>
                    )}
                  <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-white/80">
                    Нийт {activeCards.length} карт
                  </span>
                </div>
              </div>

              {/* Cards Display */}
              {activeCards.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-white/40 font-bold">
                  Энэ сэдэвт одоогоор үг эсвэл өгүүлбэр алга байна.
                </div>
              ) : boardLayout === "scatter" ? (
                /* ── SCATTERED BOARD MODE (Like Family Talk / Conversation Board) ── */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div
                    className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
                    onScroll={(e) => {
                      const page = Math.round(
                        e.currentTarget.scrollLeft / e.currentTarget.clientWidth
                      );
                      setScatterPage(page);
                    }}
                  >
                    {scatterPages.map((pageCards, pageIdx) => {
                      const layout = scatterLayouts[pageIdx];
                      return (
                        <div
                          key={pageIdx}
                          className="w-full h-full flex-shrink-0 relative snap-center"
                        >
                          {pageCards.map((card, i) => {
                            const slot = layout[i];
                            if (!slot) return null;
                            const isPlaying = playingId === card.id;
                            const isSelected = selectedCard?.id === card.id;
                            const isRevealed =
                              !hideAnswers || revealedIds.has(card.id);

                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => handleCardSelect(card)}
                                className="absolute flex flex-col items-center gap-1 active:scale-90 transition-transform text-left"
                                style={{
                                  left: `${slot.x}%`,
                                  top: `${slot.y}%`,
                                  transform: `translate(-50%, -50%) rotate(${
                                    isPlaying || isSelected ? 0 : slot.rotate
                                  }deg) scale(${
                                    isPlaying || isSelected ? 1.12 : 1
                                  })`,
                                  zIndex: isPlaying || isSelected ? 20 : 1,
                                  transition:
                                    "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                                }}
                              >
                                <div
                                  className="w-28 sm:w-32 rounded-2xl overflow-hidden shadow-xl border-2 flex flex-col items-center pb-2"
                                  style={{
                                    background:
                                      isPlaying || isSelected
                                        ? "#fffbeb"
                                        : "#ffffff",
                                    borderColor:
                                      isPlaying || isSelected
                                        ? "#facc15"
                                        : "rgba(255,255,255,0.5)",
                                    boxShadow:
                                      isPlaying || isSelected
                                        ? "0 6px 20px rgba(250,204,21,0.5)"
                                        : undefined,
                                  }}
                                >
                                  <div className="w-full h-16 sm:h-20 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {card.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={card.imageUrl}
                                        alt=""
                                        className="w-full h-full object-contain p-1"
                                      />
                                    ) : (
                                      <span className="text-3xl">
                                        {card.cardType === "word" ? "🔤" : "🗣️"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-800 font-black text-xs sm:text-sm mt-1 text-center px-1.5 leading-tight line-clamp-2">
                                    {card.japanese}
                                  </p>
                                  {isRevealed ? (
                                    <>
                                      {card.romaji && (
                                        <p className="text-pink-500 text-[10px] font-bold text-center px-1 leading-tight line-clamp-1">
                                          {card.romaji}
                                        </p>
                                      )}
                                      {(card.mongolian_meaning ||
                                        card.english_meaning) && (
                                        <p className="text-emerald-600 text-[10px] font-bold text-center px-1 leading-tight line-clamp-1 mt-0.5">
                                          {card.mongolian_meaning ||
                                            card.english_meaning}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <span className="mt-1 text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                      ❓ Дарж харах
                                    </span>
                                  )}
                                  <span className="text-xs mt-0.5">🔊</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {scatterPages.length > 1 && (
                    <div className="flex-shrink-0 flex items-center justify-center gap-2 pb-3 z-10">
                      {scatterPages.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full transition-colors ${
                            i === scatterPage ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* ── GRID CARDS MODE ── */
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {activeCards.map((card) => {
                      const isPlaying = playingId === card.id;
                      const isSelected = selectedCard?.id === card.id;
                      const isRevealed =
                        !hideAnswers || revealedIds.has(card.id);

                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => handleCardSelect(card)}
                          className="group rounded-3xl overflow-hidden shadow-lg border-2 flex flex-col text-left transition-all active:scale-95 hover:-translate-y-0.5"
                          style={{
                            background:
                              isPlaying || isSelected ? "#fffbeb" : "#ffffff",
                            borderColor:
                              isPlaying || isSelected
                                ? "#facc15"
                                : "rgba(255,255,255,0.25)",
                            boxShadow:
                              isPlaying || isSelected
                                ? "0 8px 25px rgba(250,204,21,0.45)"
                                : undefined,
                          }}
                        >
                          {/* Card Image */}
                          <div className="w-full h-28 sm:h-32 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                            {card.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={card.imageUrl}
                                alt=""
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="text-4xl">
                                {card.cardType === "word" ? "🔤" : "🗣️"}
                              </span>
                            )}
                            <span
                              className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                                card.cardType === "word"
                                  ? "bg-pink-500 text-white"
                                  : "bg-cyan-600 text-white"
                              }`}
                            >
                              {card.cardType === "word" ? "Үг" : "Өгүүлбэр"}
                            </span>
                            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-sm">
                              🔊
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-gray-900 font-black text-base leading-snug">
                                {card.japanese}
                              </p>
                              {card.hiragana &&
                                card.hiragana !== card.japanese && (
                                  <p className="text-gray-500 text-xs font-bold mt-0.5">
                                    {card.hiragana}
                                  </p>
                                )}
                              {card.romaji && (
                                <p className="text-pink-600 text-xs font-bold mt-0.5">
                                  {card.romaji}
                                </p>
                              )}
                            </div>

                            {/* Answer & Example preview */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              {isRevealed ? (
                                <div className="space-y-1">
                                  {card.mongolian_meaning && (
                                    <p className="text-xs font-black text-emerald-700">
                                      🇲🇳 {card.mongolian_meaning}
                                    </p>
                                  )}
                                  {card.english_meaning && (
                                    <p className="text-[11px] font-bold text-gray-500">
                                      🇬🇧 {card.english_meaning}
                                    </p>
                                  )}
                                  {(card.example_sentence ||
                                    card.relatedSentences.length > 0) && (
                                    <p className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg inline-block">
                                      💡 Жишээ өгүүлбэртэй
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-block text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                                  ❓ Карт дарж хариулт & жишээ харах
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40 font-bold">
              Зүүн талын цэснээс сэдэв сонгоно уу.
            </div>
          )}

          {/* ── Selected Card Answer & Examples Drawer / Modal ── */}
          {selectedCard && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedCard(null)}
            >
              <div
                className="w-full max-w-lg bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-300 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-5 py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {selectedCard.cardType === "word" ? "🔤" : "🗣️"}
                    </span>
                    <span className="font-black text-sm uppercase tracking-wider">
                      Хариулт болон Жишээ · Answer & Examples
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCard(null)}
                    className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center font-black"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 overflow-y-auto space-y-4">
                  {/* Image + Main Japanese */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    {selectedCard.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedCard.imageUrl}
                        alt=""
                        className="w-28 h-28 rounded-2xl object-contain bg-white p-2 border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-pink-50 flex items-center justify-center text-5xl flex-shrink-0">
                        {selectedCard.cardType === "word" ? "🔤" : "🗣️"}
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                        {selectedCard.japanese}
                      </p>
                      {selectedCard.hiragana &&
                        selectedCard.hiragana !== selectedCard.japanese && (
                          <p className="text-base font-bold text-gray-500 mt-0.5">
                            {selectedCard.hiragana}
                          </p>
                        )}
                      {selectedCard.romaji && (
                        <p className="text-base font-black text-pink-600 mt-0.5">
                          {selectedCard.romaji}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          speak(selectedCard.japanese, selectedCard.audioUrl)
                        }
                        className="mt-2.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs shadow active:scale-95 transition-all"
                      >
                        <span>🔊</span> Дахин сонсох
                      </button>
                    </div>
                  </div>

                  {/* Answer / Meaning Box */}
                  <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 space-y-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                      ✅ Хариулт / Утга (Answer)
                    </p>
                    {selectedCard.mongolian_meaning ? (
                      <p className="text-lg font-black text-gray-900">
                        🇲🇳 {selectedCard.mongolian_meaning}
                      </p>
                    ) : null}
                    {selectedCard.english_meaning ? (
                      <p className="text-sm font-bold text-gray-600">
                        🇬🇧 {selectedCard.english_meaning}
                      </p>
                    ) : null}
                    {!selectedCard.mongolian_meaning &&
                      !selectedCard.english_meaning && (
                        <p className="text-sm text-gray-500 font-bold">
                          {selectedCard.japanese}
                        </p>
                      )}
                  </div>

                  {/* Examples Box */}
                  {(selectedCard.example_sentence ||
                    selectedCard.relatedSentences.length > 0) && (
                    <div className="rounded-2xl bg-purple-50 border-2 border-purple-200 p-4 space-y-3">
                      <p className="text-xs font-black uppercase tracking-wider text-purple-700">
                        💡 Жишээ өгүүлбэрүүд (Examples)
                      </p>

                      {selectedCard.example_sentence && (
                        <div className="bg-white rounded-xl p-3 border border-purple-100 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-gray-900 text-base">
                              {selectedCard.example_sentence}
                            </p>
                            {selectedCard.example_sentence_reading && (
                              <p className="text-xs font-bold text-purple-600 mt-0.5">
                                {selectedCard.example_sentence_reading}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              speak(selectedCard.example_sentence!)
                            }
                            className="w-9 h-9 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0"
                          >
                            🔊
                          </button>
                        </div>
                      )}

                      {selectedCard.relatedSentences.map((rel) => (
                        <div
                          key={rel._id}
                          className="bg-white rounded-xl p-3 border border-purple-100 flex items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-black text-gray-900 text-base">
                              {rel.japanese}
                            </p>
                            {rel.romaji && (
                              <p className="text-xs font-bold text-pink-500 mt-0.5">
                                {rel.romaji}
                              </p>
                            )}
                            {(rel.mongolian_meaning || rel.english_meaning) && (
                              <p className="text-xs text-gray-500 font-bold mt-0.5">
                                {rel.mongolian_meaning || rel.english_meaning}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => speak(rel.japanese)}
                            className="w-9 h-9 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0"
                          >
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sensei Award Student Bar */}
                  {currentStudent && (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
                      <span className="text-xs font-bold text-amber-900">
                        🎯 Хариулж буй: <strong>{currentStudent}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => awardPoint(currentStudent)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow active:scale-95 transition-all"
                      >
                        ⭐ Зөв хариуллаа (+1 оноо)
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Footer: Prev / Next card */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={selectedCardIndex <= 0}
                    onClick={() => {
                      if (selectedCardIndex > 0) {
                        handleCardSelect(activeCards[selectedCardIndex - 1]);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 disabled:opacity-40 text-gray-700 font-black text-xs"
                  >
                    ← Өмнөх карт
                  </button>
                  <span className="text-xs font-bold text-gray-400">
                    {selectedCardIndex + 1} / {activeCards.length}
                  </span>
                  <button
                    type="button"
                    disabled={
                      selectedCardIndex === -1 ||
                      selectedCardIndex >= activeCards.length - 1
                    }
                    onClick={() => {
                      if (selectedCardIndex < activeCards.length - 1) {
                        handleCardSelect(activeCards[selectedCardIndex + 1]);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-black text-xs"
                  >
                    Дараагийн карт →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
