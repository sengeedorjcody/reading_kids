"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookLevel, IBellaQuestion, IBellaReading } from "@/types";
import { spaceText } from "@/lib/srt/spacing";
import { splitBellaLines, tokenizeBellaLine, isPunctuationToken } from "@/lib/bellaTokenizer";

const LEVELS: BookLevel[] = [
  "hiragana",
  "katakana",
  "beginner",
  "intermediate",
  "advanced",
  "N5",
  "N4",
  "N3",
];

interface BellaReadingFormProps {
  initial?: IBellaReading;
}

function emptyQuestion(): IBellaQuestion {
  return {
    question: "",
    questionTranslation: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
}

export default function BellaReadingForm({ initial }: BellaReadingFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?._id);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleJapanese, setTitleJapanese] = useState(initial?.titleJapanese ?? "");
  const [level, setLevel] = useState<BookLevel>(initial?.level ?? "beginner");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? 0);
  const [isPublished, setIsPublished] = useState<boolean>(
    initial?.isPublished ?? true
  );
  const [rawText, setRawText] = useState(initial?.rawText ?? "");
  const [questions, setQuestions] = useState<IBellaQuestion[]>(
    initial?.questions && initial.questions.length > 0
      ? initial.questions.map((q) => ({
          question: q.question,
          questionTranslation: q.questionTranslation ?? "",
          options: q.options.length >= 2 ? [...q.options] : ["", ""],
          correctIndex: q.correctIndex ?? 0,
          explanation: q.explanation ?? "",
        }))
      : [emptyQuestion()]
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleAutoSpace = () => {
    if (!rawText.trim()) return;
    setRawText(spaceText(rawText));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImageUrl(data.url || data.secure_url || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);

  const removeQuestion = (idx: number) =>
    setQuestions((qs) => qs.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, patch: Partial<IBellaQuestion>) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qIdx: number, optIdx: number, val: string) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, j) => (j === optIdx ? val : o)),
            }
          : q
      )
    );

  const addOption = (qIdx: number) =>
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx && q.options.length < 6
          ? { ...q, options: [...q.options, ""] }
          : q
      )
    );

  const removeOption = (qIdx: number, optIdx: number) =>
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx || q.options.length <= 2) return q;
        const nextOpts = q.options.filter((_, j) => j !== optIdx);
        let nextCorrect = q.correctIndex;
        if (optIdx === q.correctIndex) nextCorrect = 0;
        else if (optIdx < q.correctIndex) nextCorrect = q.correctIndex - 1;
        return { ...q, options: nextOpts, correctIndex: nextCorrect };
      })
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!rawText.trim()) {
      setError("Reading text is required.");
      return;
    }

    // Filter out completely empty questions; validate partially filled ones
    const preparedQuestions = questions
      .map((q) => {
        const cleanedOptions = q.options.map((o) => o.trim()).filter(Boolean);
        return {
          question: q.question.trim(),
          questionTranslation: q.questionTranslation?.trim() || undefined,
          options: cleanedOptions,
          correctIndex:
            q.correctIndex >= 0 && q.correctIndex < cleanedOptions.length
              ? q.correctIndex
              : 0,
          explanation: q.explanation?.trim() || undefined,
        };
      })
      .filter((q) => q.question.length > 0);

    for (let i = 0; i < preparedQuestions.length; i++) {
      if (preparedQuestions[i].options.length < 2) {
        setError(`Question ${i + 1} needs at least 2 answer options.`);
        return;
      }
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/bella-reading/${initial!._id}`
        : "/api/bella-reading";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          titleJapanese: titleJapanese.trim() || undefined,
          level,
          description: description.trim() || undefined,
          coverImageUrl: coverImageUrl.trim() || undefined,
          order: Number(order) || 0,
          isPublished,
          rawText: rawText.trim(),
          questions: preparedQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");

      router.push("/admin/bella-reading");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reading");
      setSaving(false);
    }
  };

  const previewLines = splitBellaLines(rawText);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm px-4 py-3 rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-700">🌸 Reading Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. うみへの ながい たび (3)"
              className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">
              Subtitle / Japanese Title (optional)
            </label>
            <input
              value={titleJapanese}
              onChange={(e) => setTitleJapanese(e.target.value)}
              placeholder="e.g. かあさんぐまの おはなし"
              className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as BookLevel)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">
              Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 accent-pink-500 rounded"
              />
              <span className="text-sm font-bold text-gray-700">Published</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">
            Description (optional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary for kids…"
            className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-1">
            Illustration / Image (optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://... or upload an image"
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <label className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold cursor-pointer transition-colors shrink-0">
              {uploading ? "Uploading…" : "📷 Upload"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {coverImageUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt="Preview"
                className="h-28 rounded-xl object-cover border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Reading Text ── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-gray-700">📖 Reading Text *</h2>
            <p className="text-xs text-gray-400">
              Separate words with spaces for exact clickable words, or click Auto-Space for Japanese text.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoSpace}
            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-2 px-4 rounded-2xl text-xs transition-colors"
          >
            ✨ Auto-space (分かち書き)
          </button>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          required
          rows={10}
          placeholder={`「うみは どっちだったかしら。」\n百日ちかくも あるいて ここに やって きて、\nふかい あなを ほった。`}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-pink-300"
          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
        />

        {/* Live clickable-word preview */}
        {previewLines.length > 0 && (
          <div className="p-4 bg-pink-50/70 rounded-2xl border border-pink-100 space-y-2">
            <p className="text-xs font-bold text-pink-500">
              Preview — {previewLines.length} lines (each pill is a clickable word):
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {previewLines.map((line, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-bold text-pink-300 mr-1">
                    {i + 1}.
                  </span>
                  {tokenizeBellaLine(line).map((tok, j) =>
                    isPunctuationToken(tok) ? (
                      <span key={j} className="text-sm text-gray-500">
                        {tok}
                      </span>
                    ) : (
                      <span
                        key={j}
                        className="text-sm bg-white border border-pink-200 text-gray-700 px-2 py-0.5 rounded-lg font-medium"
                      >
                        {tok}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Questions Builder ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-700">
              ❓ Comprehension Questions ({questions.length})
            </h2>
            <p className="text-xs text-gray-400">
              Shown after finishing the reading passage. Select the correct option with the radio button.
            </p>
          </div>
          <button
            type="button"
            onClick={addQuestion}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded-2xl text-sm transition-colors"
          >
            ＋ Add Question
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="bg-white rounded-3xl p-5 shadow-sm space-y-3 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-pink-500">
                Question {qIdx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(qIdx)}
                className="text-rose-400 hover:text-rose-600 text-xs font-bold"
              >
                ✕ Remove
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Question text
              </label>
              <input
                value={q.question}
                onChange={(e) =>
                  updateQuestion(qIdx, { question: e.target.value })
                }
                placeholder="e.g. かあさんぐまは どのくらい あるきましたか？"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-base focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Translation / Hint (Mongolian or English, optional)
              </label>
              <input
                value={q.questionTranslation ?? ""}
                onChange={(e) =>
                  updateQuestion(qIdx, { questionTranslation: e.target.value })
                }
                placeholder="e.g. Ээж баавгай хэр удаан алхсан бэ?"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {/* Answer options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500">
                  Options (pick the correct answer)
                </label>
                {q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => addOption(qIdx)}
                    className="text-xs font-bold text-blue-500 hover:underline"
                  >
                    + Add option
                  </button>
                )}
              </div>

              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctIndex === optIdx}
                    onChange={() =>
                      updateQuestion(qIdx, { correctIndex: optIdx })
                    }
                    title="Mark as correct answer"
                    className="w-4 h-4 accent-emerald-500 shrink-0 cursor-pointer"
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                    placeholder={`Option ${optIdx + 1}${
                      q.correctIndex === optIdx ? " (Correct)" : ""
                    }`}
                    className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                      q.correctIndex === optIdx
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-gray-200"
                    }`}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIdx, optIdx)}
                      className="text-gray-400 hover:text-rose-500 text-xs font-bold px-1.5"
                      title="Remove option"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                Explanation (shown after answering, optional)
              </label>
              <input
                value={q.explanation ?? ""}
                onChange={(e) =>
                  updateQuestion(qIdx, { explanation: e.target.value })
                }
                placeholder="e.g. 「百日ちかくも あるいて」と かいて あります。"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-black py-4 rounded-3xl text-xl transition-colors active:scale-95 shadow-lg shadow-pink-200"
      >
        {saving
          ? "Saving…"
          : isEdit
          ? "💾 Save Changes"
          : "🌸 Create Bella Reading"}
      </button>
    </form>
  );
}
