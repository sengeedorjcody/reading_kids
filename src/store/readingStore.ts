"use client";

import { create } from "zustand";
import { IDictionaryWord } from "@/types";

interface ReadingStore {
  selectedWord: IDictionaryWord | null;
  selectedSurface: string | null;
  setSelectedWord: (word: IDictionaryWord | null, surface?: string) => void;
  clearSelection: () => void;
}

export const useReadingStore = create<ReadingStore>((set) => ({
  selectedWord: null,
  selectedSurface: null,
  setSelectedWord: (word, surface) =>
    set({ selectedWord: word, selectedSurface: surface ?? word?.japanese_word ?? null }),
  clearSelection: () => set({ selectedWord: null, selectedSurface: null }),
}));
