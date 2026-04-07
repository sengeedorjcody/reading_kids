"use client";

import { useCallback, useRef } from "react";

export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((text: string, audioUrl?: string) => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => {
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

function detectLang(text: string): "ja-JP" | "mn-MN" {
  return /[\u0400-\u04FF]/.test(text) ? "mn-MN" : "ja-JP";
}

function getBestVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();

  if (lang === "mn-MN") {
    return (
      voices.find((v) => v.lang.startsWith("ru")) ??
      voices.find((v) => v.lang.startsWith("mn"))
    );
  }

  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
  );
}

function doSpeak(text: string) {
  const ss = window.speechSynthesis;

  // iOS Safari: if synthesis is paused/stuck, resume it first
  if (ss.paused) ss.resume();

  // Cancel any ongoing speech
  ss.cancel();

  const lang = detectLang(text);
  const utteranceLang = lang === "mn-MN" ? "ru-RU" : lang;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = utteranceLang;
  utterance.rate = lang === "mn-MN" ? 0.75 : 0.8;
  utterance.pitch = 1.1;

  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  // iOS needs a short delay after cancel() before speak() works reliably
  setTimeout(() => ss.speak(utterance), 50);
}

function speakWithWebAPI(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // { once: true } prevents multiple handlers stacking up on repeated calls
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => doSpeak(text),
      { once: true }
    );
  } else {
    doSpeak(text);
  }
}
