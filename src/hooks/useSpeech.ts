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

/** Detect language from character unicode range */
function detectLang(text: string): "ja-JP" | "mn-MN" {
  // Cyrillic block: U+0400–U+04FF
  return /[\u0400-\u04FF]/.test(text) ? "mn-MN" : "ja-JP";
}

function getBestVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();

  // For Mongolian: prefer Russian voice directly — same Cyrillic script, sounds natural
  if (lang === "mn-MN") {
    return (
      voices.find((v) => v.lang.startsWith("ru")) ??
      voices.find((v) => v.lang.startsWith("mn"))
    );
  }

  // For other languages: exact match → prefix match
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
  );
}

function doSpeak(text: string) {
  window.speechSynthesis.cancel();
  const lang = detectLang(text);
  // Use ru-RU as the utterance lang for Cyrillic — Russian TTS reads it correctly
  const utteranceLang = lang === "mn-MN" ? "ru-RU" : lang;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = utteranceLang;
  utterance.rate = lang === "mn-MN" ? 0.75 : 0.8;
  utterance.pitch = 1.1;

  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

function speakWithWebAPI(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Voices may not be loaded yet on first call — wait for voiceschanged if needed
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      doSpeak(text);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
  } else {
    doSpeak(text);
  }
}
