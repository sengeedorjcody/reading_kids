"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

interface Selection {
  lineIndex: number;
  start: number; // inclusive char index (Array.from-based)
  end: number;   // exclusive
  text: string;
}

const WORD_CHAR = /[぀-ヿ㐀-鿿豈-﫿ー]/;
const MAX_LOOKUP_LEN = 6;

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

  const activeIndex = video
    ? video.transcript.reduce((best, line, i) => (line.start <= currentTime ? i : best), -1)
    : -1;

  const seekTo = (start: number) => {
    playerRef.current?.seekTo?.(start, true);
    playerRef.current?.playVideo?.();
  };

  // Tap a character in a line: greedily try the longest run of word-characters
  // starting there and look up the longest substring that's actually in the
  // dictionary (falls back to the single tapped character if nothing matches).
  const lookupAt = useCallback((lineIndex: number, lineText: string, charIndex: number) => {
    const chars = Array.from(lineText);
    if (!WORD_CHAR.test(chars[charIndex])) return;

    let runEnd = charIndex;
    while (runEnd < chars.length && runEnd - charIndex < MAX_LOOKUP_LEN && WORD_CHAR.test(chars[runEnd])) {
      runEnd++;
    }
    const maxLen = runEnd - charIndex;
    const candidates: string[] = [];
    for (let len = maxLen; len >= 1; len--) candidates.push(chars.slice(charIndex, charIndex + len).join(""));

    setSelection({ lineIndex, start: charIndex, end: charIndex + 1, text: candidates[candidates.length - 1] });
    setDictEntry(null);
    setLookupLoading(true);

    Promise.all(candidates.map((c) => fetchDictEntry(c).catch(() => null)))
      .then((results) => {
        const hitIndex = results.findIndex((r) => r !== null);
        const matched = hitIndex >= 0 ? candidates[hitIndex] : candidates[candidates.length - 1];
        setSelection({ lineIndex, start: charIndex, end: charIndex + matched.length, text: matched });
        setDictEntry(hitIndex >= 0 ? results[hitIndex] : null);
        speak(matched);
      })
      .finally(() => setLookupLoading(false));
  }, [speak]);

  if (!video) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <span className="text-4xl animate-spin">📺</span>
      </div>
    );
  }

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

      {/* 1 + 2 + 3: on desktop, three equal columns side by side; on mobile, stacked */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0">
        {/* 1. Video column */}
        <div className="flex-shrink-0 sm:flex-1 w-full aspect-video sm:aspect-auto sm:h-full bg-black">
          <div ref={playerElRef} className="w-full h-full" />
        </div>

        {/* 2. Transcript column */}
        <div className="flex-1 sm:border-l overflow-y-auto px-3 py-3 min-h-0" style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.1)" }}>
          {video.transcript.map((line, i) => {
            const isActive = i === activeIndex;
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
                  {Array.from(line.text).map((ch, ci) => {
                    const isSelected = !!selection && selection.lineIndex === i && ci >= selection.start && ci < selection.end;
                    const clickable = WORD_CHAR.test(ch);
                    return (
                      <span
                        key={ci}
                        onClick={clickable ? (e) => { e.stopPropagation(); lookupAt(i, line.text, ci); } : undefined}
                        className={`font-bold rounded transition-all ${clickable ? "cursor-pointer" : ""}`}
                        style={{
                          color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                          fontSize: 16,
                          background: isSelected ? "rgba(251,191,36,0.35)" : "transparent",
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Dictionary column */}
        <div className="flex-1 border-t sm:border-t-0 sm:border-l overflow-y-auto px-4 py-4"
          style={{ background: "#111827", borderColor: "rgba(255,255,255,0.1)", minHeight: 140 }}
        >
          {!selection && (
            <p className="text-white/30 text-sm text-center mt-6">Үг дээр дарж утгыг харна уу</p>
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
                    <img src={dictEntry.example_image_url} alt={selection.text} className="w-full rounded-xl mt-2 object-cover" style={{ maxHeight: 140 }} />
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
