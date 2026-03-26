"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IDictionaryWord } from "@/types";
import DeleteButton from "./DeleteButton";
import { deleteWord, deleteWords } from "@/app/admin/dictionary/actions";

interface DictionaryTableProps {
  words: IDictionaryWord[];
}

export default function DictionaryTable({ words }: DictionaryTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allIds = words.map((w) => w._id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selected.size} selected word${selected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteWords(Array.from(selected));
      setSelected(new Set());
    });
  };

  return (
    <div className="relative">
      {/* ── Bulk action bar ── */}
      {someSelected && (
        <div className="sticky top-4 z-20 mx-auto mb-4 flex items-center justify-between gap-4 bg-white border-2 border-red-200 rounded-2xl px-5 py-3 shadow-lg">
          <span className="font-bold text-gray-700">
            <span className="text-red-500 font-black">{selected.size}</span> word{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Deleting…
                </>
              ) : (
                <>🗑 Delete {selected.size} selected</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                  title="Select all"
                />
              </th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">Word</th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">Romaji</th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">English</th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">Mongolian</th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">Image</th>
              <th className="text-left p-4 text-sm font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word, i) => {
              const isSelected = selected.has(word._id);
              return (
                <tr
                  key={word._id}
                  onClick={() => toggle(word._id)}
                  className={`cursor-pointer transition-colors ${
                    i !== words.length - 1 ? "border-b border-gray-50" : ""
                  } ${isSelected ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                >
                  {/* Checkbox */}
                  <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(word._id)}
                      className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                    />
                  </td>

                  {/* Word */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="text-2xl font-bold text-gray-800">{word.japanese_word}</div>
                    {word.hiragana && word.hiragana !== word.japanese_word && (
                      <div className="text-sm text-pink-400">{word.hiragana}</div>
                    )}
                  </td>

                  {/* Romaji */}
                  <td className="p-4 text-blue-400 italic" onClick={(e) => e.stopPropagation()}>
                    {word.romaji}
                  </td>

                  {/* English */}
                  <td className="p-4 text-gray-600" onClick={(e) => e.stopPropagation()}>
                    {word.english_meaning}
                  </td>

                  {/* Mongolian */}
                  <td className="p-4 text-gray-600" onClick={(e) => e.stopPropagation()}>
                    {word.mongolian_meaning}
                  </td>

                  {/* Image */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {word.example_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={word.example_image_url}
                        alt={word.japanese_word}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/dictionary/${word._id}/edit`}
                        className="text-purple-500 font-bold text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteWord.bind(null, word._id)}
                        confirmMessage="Delete this word?"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
