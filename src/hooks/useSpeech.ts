"use client";

import { useCallback, useRef } from "react";

export function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback((text: string, audioUrlOrLang?: string) => {
    // If second arg looks like a BCP-47 lang tag (e.g. "en-US"), use it as a lang override
    const isLangTag = audioUrlOrLang
      ? /^[a-z]{2}(-[A-Z]{2})?$/.test(audioUrlOrLang)
      : false;

    if (audioUrlOrLang && !isLangTag) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrlOrLang);
      audioRef.current = audio;
      audio.play().catch(() => {
        speakWithWebAPI(text);
      });
      return;
    }

    speakWithWebAPI(text, isLangTag ? audioUrlOrLang : undefined);
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

  if (lang.startsWith("en")) {
    return (
      voices.find((v) => v.lang === "en-US") ??
      voices.find((v) => v.lang.startsWith("en"))
    );
  }

  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0]))
  );
}

function doSpeak(text: string, langOverride?: string) {
  const ss = window.speechSynthesis;

  // iOS Safari: if synthesis is paused/stuck, resume it first
  if (ss.paused) ss.resume();

  // Cancel any ongoing speech
  ss.cancel();

  const lang = langOverride ?? detectLang(text);
  const utteranceLang = lang === "mn-MN" ? "ru-RU" : lang;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = utteranceLang;
  utterance.rate = lang === "mn-MN" ? 0.75 : (lang.startsWith("en") ? 0.85 : 0.8);
  utterance.pitch = 1.1;

  const voice = getBestVoice(lang);
  if (voice) utterance.voice = voice;

  // Speak synchronously, in the same tick as the user gesture that triggered
  // this — iOS Safari silently drops speak() calls made even a few ms after
  // the gesture (e.g. via setTimeout), and this is especially strict inside
  // iframes (our own mini-games embedded via /games/[id]).
  ss.speak(utterance);
}

function speakWithWebAPI(text: string, langOverride?: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // { once: true } prevents multiple handlers stacking up on repeated calls
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => doSpeak(text, langOverride),
      { once: true }
    );
  } else {
    doSpeak(text, langOverride);
  }
}
