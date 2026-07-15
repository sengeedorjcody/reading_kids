"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in the default TS lib).
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  results: { 0: SpeechRecognitionResult; length: number };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
}

/**
 * Wraps the browser Web Speech recognition for a single English utterance.
 * `supported` is false where the API is missing (e.g. some iOS Safari builds) so
 * the caller can offer a fallback instead of a dead mic button.
 */
export function useSpeechRecognition(onResult: (r: SpeechResult) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);
  // Keep the latest callback without re-creating the recognizer.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const recog = new Ctor();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    recog.onresult = (e) => {
      const best = e.results[0]?.[0];
      if (best) {
        onResultRef.current({
          transcript: best.transcript ?? "",
          confidence: typeof best.confidence === "number" ? best.confidence : 0,
        });
      }
    };
    recog.onerror = (e) => {
      setError(e.error);
      setListening(false);
    };
    recog.onend = () => setListening(false);

    recogRef.current = recog;
    return () => {
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      try {
        recog.abort();
      } catch {
        /* ignore */
      }
      recogRef.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const recog = recogRef.current;
    if (!recog || listening) return;
    setError(null);
    try {
      recog.start();
      setListening(true);
    } catch {
      // start() throws if called while already active — ignore.
    }
  }, [listening]);

  const stop = useCallback(() => {
    recogRef.current?.stop();
  }, []);

  return { supported, listening, error, start, stop };
}
