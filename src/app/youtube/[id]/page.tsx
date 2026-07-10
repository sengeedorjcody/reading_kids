"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IYoutubeVideo } from "@/lib/db/models/YoutubeVideo";
import { useSpeech } from "@/hooks/useSpeech";

interface DictEntry {
  japanese_word: string;
  hiragana?: string;
  romaji?: string;
  english_meaning?: string;
  mongolian_meaning?: string;
  example_image_url?: string;
}

interface Token {
  text: string;
  isWord: boolean; // false for punctuation/whitespace segments
}

interface Selection {
  lineIndex: number;
  tokenStart: number; // inclusive token index
  tokenEnd: number;   // exclusive
  text: string;
}

const MAX_MERGE_TOKENS = 3; // adjacent word-segmenter tokens to try merging for compound words

// Prefer the real Intl.Segmenter (ICU dictionary-based word breaking, built into
// modern browsers) so words like 話します / 自己紹介 keep proper boundaries instead
// of being split character-by-character.
const jaSegmenter: Intl.Segmenter | null =
  typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("ja", { granularity: "word" }) : null;

// Trailing/leading punctuation (。、！？!?.,「」『』・…) shouldn't be part of a
// lookup — split it into its own non-word token so it never reaches the dictionary.
const PUNCT = "。、！？!?.,「」『』・…";
const PUNCT_SPLIT = new RegExp(`^([${PUNCT}]*)([\\s\\S]*?)([${PUNCT}]*)$`);

function splitPunctuation(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const t of tokens) {
    if (!t.isWord) { out.push(t); continue; }
    const m = t.text.match(PUNCT_SPLIT);
    const [, lead, core, trail] = m ?? ["", "", t.text, ""];
    if (!core) { out.push({ text: t.text, isWord: false }); continue; }
    if (lead) out.push({ text: lead, isWord: false });
    out.push({ text: core, isWord: true });
    if (trail) out.push({ text: trail, isWord: false });
  }
  return out;
}

function segmentLine(text: string): Token[] {
  // Lines that were manually pre-segmented with spaces (e.g. "私 は 今日") keep that as-is.
  if (/\s/.test(text)) {
    const tokens = text.split(/(\s+)/).filter(Boolean).map((t) => ({ text: t, isWord: !/^\s+$/.test(t) }));
    return splitPunctuation(tokens);
  }
  if (jaSegmenter) {
    const tokens = Array.from(jaSegmenter.segment(text)).map((s) => ({ text: s.segment, isWord: !!s.isWordLike }));
    return splitPunctuation(tokens);
  }
  return splitPunctuation([{ text, isWord: true }]);
}

async function fetchDictEntry(text: string): Promise<DictEntry | null> {
  const res = await fetch(`/api/dictionary?q=${encodeURIComponent(text)}&exact=true&limit=1`);
  const data = await res.json();
  return data.words?.[0] ?? null;
}

declare global {
  interface Window {
    YT: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function YoutubeStudyPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<IYoutubeVideo | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dictEntry, setDictEntry] = useState<DictEntry | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [videoWidthPct, setVideoWidthPct] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const columnsRef = useRef<HTMLDivElement>(null);

  const playerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const playerElRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const { speak } = useSpeech();

  // Fetch video data
  useEffect(() => {
    fetch(`/api/youtube/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) { router.replace("/youtube"); return; }
        setVideo(data);
      })
      .catch(() => router.replace("/youtube"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Load YouTube IFrame API + create player once we have the video id
  useEffect(() => {
    if (!video) return;

    const createPlayer = () => {
      if (!playerElRef.current) return;
      playerRef.current = new window.YT.Player(playerElRef.current, {
        videoId: video.youtubeId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 1) { // playing
              pollRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.();
                if (typeof t === "number") setCurrentTime(t);
              }, 300);
            } else if (pollRef.current) {
              clearInterval(pollRef.current);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [video]);

  // Auto-scroll active transcript line into view
  useEffect(() => {
    activeLineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentTime]);

  // Track desktop (3-columns-in-a-row) vs mobile layout so the video column
  // only gets a custom drag-resized width when columns are actually side by side.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const startColumnResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const rect = columnsRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsResizing(true);
    const onMove = (ev: PointerEvent) => {
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setVideoWidthPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Default video column width matches what the equal-columns layout would
  // give it (1/3 with a transcript, 1/2 without) — dragging can then grow or
  // shrink it from there instead of snapping to a fixed 50% on first render.
  useEffect(() => {
    if (!video || videoWidthPct !== null) return;
    setVideoWidthPct(video.transcript.length > 0 ? 100 / 3 : 50);
  }, [video, videoWidthPct]);

  // Segment every line into words once, when the video loads
  const linesTokens = useMemo(
    () => video ? video.transcript.map((line) => segmentLine(line.text)) : [],
    [video]
  );

  const activeIndex = video
    ? video.transcript.reduce((best, line, i) => (line.start <= currentTime ? i : best), -1)
    : -1;

  const seekTo = (start: number) => {
    playerRef.current?.seekTo?.(start, true);
    playerRef.current?.playVideo?.();
  };

  // Tap a word token: try merging it with the next 1-2 tokens to catch
  // compound words, picking the longest combination that's actually in the
  // dictionary (falls back to just the tapped token if nothing matches).
  const lookupAt = useCallback((lineIndex: number, tokens: Token[], tokenIndex: number) => {
    if (!tokens[tokenIndex]?.isWord) return;

    let mergeCount = 1;
    while (
      mergeCount < MAX_MERGE_TOKENS &&
      tokens[tokenIndex + mergeCount]?.isWord
    ) {
      mergeCount++;
    }

    const candidates: { text: string; tokenEnd: number }[] = [];
    for (let n = mergeCount; n >= 1; n--) {
      const text = tokens.slice(tokenIndex, tokenIndex + n).map((t) => t.text).join("");
      candidates.push({ text, tokenEnd: tokenIndex + n });
    }

    const fallback = candidates[candidates.length - 1];
    setSelection({ lineIndex, tokenStart: tokenIndex, tokenEnd: fallback.tokenEnd, text: fallback.text });
    setDictEntry(null);
    setLookupLoading(true);

    Promise.all(candidates.map((c) => fetchDictEntry(c.text).catch(() => null)))
      .then((results) => {
        const hitIndex = results.findIndex((r) => r !== null);
        const matched = hitIndex >= 0 ? candidates[hitIndex] : fallback;
        setSelection({ lineIndex, tokenStart: tokenIndex, tokenEnd: matched.tokenEnd, text: matched.text });
        setDictEntry(hitIndex >= 0 ? results[hitIndex] : null);
        speak(matched.text);
      })
      .finally(() => setLookupLoading(false));
  }, [speak]);

  // Manual dictionary search — used when a video has no transcript to tap words from.
  const searchWord = useCallback((query: string) => {
    const text = query.trim();
    if (!text) return;
    setSelection({ lineIndex: -1, tokenStart: 0, tokenEnd: 0, text });
    setDictEntry(null);
    setLookupLoading(true);
    fetchDictEntry(text)
      .then((entry) => { setDictEntry(entry); speak(text); })
      .catch(() => setDictEntry(null))
      .finally(() => setLookupLoading(false));
  }, [speak]);

  if (!video) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <span className="text-4xl animate-spin">📺</span>
      </div>
    );
  }

  const hasTranscript = video.transcript.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-black">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-3 py-2" style={{ background: "#111827" }}>
        <button
          onClick={() => router.push("/youtube")}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white active:scale-90"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          ←
        </button>
        <h1 className="text-white font-black text-sm truncate flex-1">{video.title}</h1>
      </div>

      {/* 1 + 2 + 3: on desktop, three columns side by side (video is drag-resizable); on mobile, stacked */}
      <div ref={columnsRef} className="flex-1 flex flex-col min-[900px]:flex-row min-h-0">
        {/* 1. Video column */}
        <div
          className="flex-shrink-0 min-[900px]:flex-1 w-full aspect-video min-[900px]:aspect-auto min-[900px]:h-full bg-black"
          style={isDesktop && videoWidthPct !== null ? { width: `${videoWidthPct}%`, flex: "none" } : undefined}
        >
          <div ref={playerElRef} className="w-full h-full" />
        </div>

        {/* Drag handle to resize the video column (desktop only) */}
        <div
          onPointerDown={startColumnResize}
          className="hidden min-[900px]:flex flex-shrink-0 items-center justify-center active:bg-white/10 transition-colors"
          style={{ width: 10, cursor: "col-resize", background: "rgba(255,255,255,0.03)" }}
        >
          <div style={{ width: 3, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* While resizing, block pointer events from reaching the YouTube iframe —
            it's cross-origin, so a mouseup/pointerup released over it never bubbles
            back to our window listeners and the drag would get stuck "on" forever. */}
        {isResizing && (
          <div className="fixed inset-0 z-[9999]" style={{ cursor: "col-resize" }} />
        )}

        {/* 2. Transcript column — only when the video has one */}
        {hasTranscript && (
        <div className="flex-1 min-[900px]:border-l overflow-y-auto px-3 py-3 min-h-0" style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.1)" }}>
          {video.transcript.map((line, i) => {
            const isActive = i === activeIndex;
            const tokens = linesTokens[i] ?? [];
            return (
              <div
                key={i}
                ref={isActive ? activeLineRef : undefined}
                onClick={() => seekTo(line.start)}
                className="rounded-xl px-3 py-2 mb-1 cursor-pointer transition-all"
                style={{
                  background: isActive ? "rgba(139,92,246,0.25)" : "transparent",
                  border: isActive ? "1px solid rgba(139,92,246,0.5)" : "1px solid transparent",
                }}
              >
                <div className="flex flex-wrap">
                  {tokens.map((tok, ti) => {
                    const isSelected = !!selection && selection.lineIndex === i && ti >= selection.tokenStart && ti < selection.tokenEnd;
                    return (
                      <span
                        key={ti}
                        onClick={tok.isWord ? (e) => { e.stopPropagation(); lookupAt(i, tokens, ti); } : undefined}
                        className={`font-bold rounded transition-all whitespace-pre ${tok.isWord ? "cursor-pointer" : ""}`}
                        style={{
                          color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                          fontSize: 16,
                          background: isSelected ? "rgba(251,191,36,0.35)" : "transparent",
                        }}
                      >
                        {tok.text}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* 3. Dictionary column */}
        <div className="flex-1 border-t min-[900px]:border-t-0 min-[900px]:border-l overflow-y-auto px-4 py-4"
          style={{ background: "#111827", borderColor: "rgba(255,255,255,0.1)", minHeight: 140 }}
        >
          {!hasTranscript && (
            <form
              onSubmit={(e) => { e.preventDefault(); searchWord(searchQuery); }}
              className="flex items-center gap-2 mb-4"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="単語を入力… (үг бичих)"
                lang="ja"
                className="flex-1 rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
                style={{ background: "rgba(139,92,246,0.4)" }}
              >
                🔍
              </button>
            </form>
          )}
          {!selection && (
            <p className="text-white/30 text-sm text-center mt-6">
              {hasTranscript ? "Үг дээр дарж утгыг харна уу" : "Дээрх хэсэгт үг бичиж хайна уу"}
            </p>
          )}
          {selection && lookupLoading && (
            <p className="text-white/40 text-sm text-center mt-6">Хайж байна…</p>
          )}
          {selection && !lookupLoading && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-black text-2xl">{selection.text}</span>
                <button onClick={() => speak(selection.text)} className="text-lg active:scale-90">🔊</button>
              </div>
              {dictEntry ? (
                <div className="space-y-1.5">
                  {dictEntry.hiragana && dictEntry.hiragana !== dictEntry.japanese_word && (
                    <p className="text-purple-300 text-sm font-bold">{dictEntry.hiragana}</p>
                  )}
                  {dictEntry.romaji && <p className="text-white/40 text-xs">{dictEntry.romaji}</p>}
                  {dictEntry.english_meaning && (
                    <p className="text-white/80 text-sm font-bold">{dictEntry.english_meaning}</p>
                  )}
                  {dictEntry.mongolian_meaning && (
                    <p className="text-white/60 text-sm">{dictEntry.mongolian_meaning}</p>
                  )}
                  {dictEntry.example_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dictEntry.example_image_url} alt={selection.text} className="w-full rounded-xl mt-2 object-contain" style={{ maxHeight: 220 }} />
                  )}
                </div>
              ) : (
                <p className="text-white/30 text-xs">Толь бичигт олдсонгүй</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
