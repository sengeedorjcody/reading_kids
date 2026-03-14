"use client";

import { useCallback, useRef } from "react";

export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((text: string, audioUrl?: string) => {
    // If there's a cloudinary audio URL, use it
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {
        // Fallback to Web Speech API if audio fails
        speakWithWebAPI(text);
      });
      return;
    }

    speakWithWebAPI(text);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}

function speakWithWebAPI(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.8;
  utterance.pitch = 1.1;

  // Try to find a Japanese voice
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(
    (v) => v.lang.startsWith("ja") || v.name.toLowerCase().includes("japanese")
  );
  if (jaVoice) utterance.voice = jaVoice;

  window.speechSynthesis.speak(utterance);
}
