"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IBellaReading } from "@/types";
import DictionaryPanel from "@/components/reading/DictionaryPanel";
import WordToken from "@/components/reading/WordToken";
import { useReadingStore } from "@/store/readingStore";
import { useSpeech } from "@/hooks/useSpeech";
import { isPunctuationToken } from "@/lib/bellaTokenizer";

interface BellaReadingReaderProps {
  reading: IBellaReading;
}

type Mode = "read" | "quiz";
type TextSize = "sm" | "md" | "lg";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function BellaReadingReader({ reading }: BellaReadingReaderProps) {
  const { selectedSurface, clearSelection } = useReadingStore();
  const { speak, stop } = useSpeech();

  const [mode, setMode] = useState<Mode>("read");
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [isReadingAll, setIsReadingAll] = useState(false);

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showSummary, setShowSummary] = useState(false);

  const questions = reading.questions ?? [];
  const hasQuestions = questions.length > 0;

  useEffect(() => {
    clearSelection();
    return () => {
      clearSelection();
      stop();
    };
  }, [clearSelection, stop]);

  const handleReadAll = () => {
    if (isReadingAll) {
      stop();
      setIsReadingAll(false);
      return;
    }
    const fullText = reading.sentences.map((s) => s.text).join("。");
    speak(fullText || reading.rawText);
    setIsReadingAll(true);
  };

  const handleStartQuiz = () => {
    stop();
    setIsReadingAll(false);
    clearSelection();
    setMode("quiz");
  };

  const handleRetryQuiz = () => {
    setQIndex(0);
    setAnswers({});
    setShowSummary(false);
  };

  const handleSelectOption = (optIdx: number) => {
    if (answers[qIndex] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIdx }));
  };

  const handleNextQuestion = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const score = questions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
    0
  );

  const sizeClass =
    textSize === "sm"
      ? "scale-95 origin-top-left"
      : textSize === "lg"
      ? "scale-110 origin-top-left"
      : "";

  return (
    <div className="h-screen flex flex-col bg-[#2d1f0e] overflow-hidden">
      {/* Top header bar */}
      <header className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[#1e140a] border-b border-[#5a3e28] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/bella-reading"
            className="text-[#c8a96e] hover:text-[#fdf6e8] font-bold text-sm shrink-0 transition-colors"
          >
            ← Bella Reading
          </Link>
          <span className="text-[#5a3e28] hidden sm:inline">|</span>
          <h1 className="text-[#fdf6e8] font-black text-sm sm:text-base truncate">
            🌸 {reading.title}
          </h1>
          {reading.titleJapanese && (
            <span className="text-[#c8a96e]/70 text-xs hidden md:inline truncate">
              {reading.titleJapanese}
            </span>
          )}
        </div>

        {/* Mode switch tabs */}
        {hasQuestions && (
          <div className="flex items-center gap-1 bg-[#2d1f0e] p-1 rounded-xl border border-[#5a3e28] shrink-0">
            <button
              type="button"
              onClick={() => setMode("read")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "read"
                  ? "bg-[#c8783c] text-white shadow"
                  : "text-[#c8a96e]/70 hover:text-[#fdf6e8]"
              }`}
            >
              📖 よむ
            </button>
            <button
              type="button"
              onClick={handleStartQuiz}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "quiz"
                  ? "bg-pink-500 text-white shadow"
                  : "text-[#c8a96e]/70 hover:text-[#fdf6e8]"
              }`}
            >
              ❓ しつもん ({questions.length})
            </button>
          </div>
        )}
      </header>

      {/* Main workspace */}
      {mode === "read" ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Dictionary Panel (Desktop) */}
          <aside className="w-80 flex-shrink-0 hidden md:flex flex-col bg-[#1e140a] border-r border-[#5a3e28]">
            <div className="px-5 py-3.5 border-b border-[#5a3e28]">
              <h2 className="text-sm font-bold text-[#c8a96e] uppercase tracking-wider">
                📖 じしょ · Dictionary
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <DictionaryPanel />
            </div>
          </aside>

          {/* Right: Paper reading area */}
          <main className="flex-1 overflow-hidden flex flex-col items-center justify-center p-3 md:p-6">
            <div className="w-full max-w-3xl h-full flex flex-col book-page rounded-2xl overflow-hidden">
              {/* Paper toolbar */}
              <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-[#d4b87a]/40 shrink-0">
                <span className="text-xs font-bold text-[#a07840]">
                  👆 ことばをタップすると いみが でるよ
                </span>
                <div className="flex items-center gap-2">
                  {/* Text size */}
                  <div className="hidden sm:flex items-center bg-[#f5ecd4] rounded-xl p-0.5 border border-[#d4b87a]/50">
                    {(["sm", "md", "lg"] as TextSize[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTextSize(sz)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors ${
                          textSize === sz
                            ? "bg-[#c8783c] text-white"
                            : "text-[#6b4423] hover:bg-[#ead5a8]"
                        }`}
                      >
                        {sz === "sm" ? "小" : sz === "md" ? "中" : "大"}
                      </button>
                    ))}
                  </div>

                  {/* Read all aloud */}
                  <button
                    type="button"
                    onClick={handleReadAll}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                      isReadingAll
                        ? "bg-rose-500 text-white border-rose-600"
                        : "bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] border-[#d4b87a]/60"
                    }`}
                  >
                    {isReadingAll ? "⏹ とめる" : "🔊 ぜんぶ よむ"}
                  </button>
                </div>
              </div>

              {/* Scrollable passage body */}
              <div className="flex-1 overflow-y-auto reading-scroll px-5 sm:px-10 py-6">
                {reading.coverImageUrl && (
                  <div className="mb-6 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reading.coverImageUrl}
                      alt={reading.title}
                      className="max-h-56 rounded-2xl shadow-md border border-[#d4b87a]/40 object-contain"
                    />
                  </div>
                )}

                <div className={`space-y-2.5 ${sizeClass}`}>
                  {reading.sentences.map((sentence, sIdx) => (
                    <div
                      key={sentence._id || sIdx}
                      className="group flex items-start gap-2 rounded-xl px-2 py-1 hover:bg-[#f5ecd4]/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => speak(sentence.text)}
                        title="Listen to this line"
                        className="mt-2 shrink-0 w-7 h-7 rounded-full bg-[#f5ecd4] hover:bg-[#c8783c] hover:text-white text-[#a07840] text-xs flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
                      >
                        🔊
                      </button>
                      <div className="flex flex-wrap items-end leading-relaxed">
                        {sentence.words && sentence.words.length > 0 ? (
                          sentence.words.map((word, wIdx) =>
                            isPunctuationToken(word.surface) ? (
                              <span
                                key={`${word.surface}-${wIdx}`}
                                className="text-lg md:text-2xl font-bold text-[#2d1f0e] book-font pb-0.5 select-none"
                              >
                                {word.surface}
                              </span>
                            ) : (
                              <WordToken
                                key={`${word.surface}-${wIdx}`}
                                word={word}
                              />
                            )
                          )
                        ) : (
                          <p className="text-lg md:text-2xl font-bold text-[#2d1f0e] book-font">
                            {sentence.text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Finish Reading CTA */}
              <div className="px-5 py-4 border-t border-[#d4b87a]/40 bg-[#f5ecd4]/60 flex items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-[#6b4423]/70 font-medium hidden sm:inline">
                  {hasQuestions
                    ? `よみおわったら ${questions.length}もん の しつもんに こたえよう！`
                    : "さいごまで よめたね！"}
                </span>

                {hasQuestions ? (
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="w-full sm:w-auto ml-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black py-3 px-7 rounded-2xl text-base shadow-lg shadow-pink-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    ✅ よみおわった！ しつもんへ ({questions.length}) →
                  </button>
                ) : (
                  <Link
                    href="/bella-reading"
                    className="w-full sm:w-auto ml-auto text-center bg-[#c8783c] hover:bg-[#b5652b] text-white font-black py-3 px-7 rounded-2xl text-base shadow-md transition-all active:scale-95"
                  >
                    🎉 よみおわった！ もどる
                  </Link>
                )}
              </div>
            </div>
          </main>

          {/* Mobile Dictionary Drawer */}
          {selectedSurface && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e140a] border-t-2 border-[#c8a96e] rounded-t-3xl shadow-2xl z-30 max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="w-12 h-1 bg-[#5a3e28] rounded-full" />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[#c8a96e]/60 hover:text-[#c8a96e] text-lg font-bold leading-none"
                >
                  ✕
                </button>
              </div>
              <DictionaryPanel />
            </div>
          )}
        </div>
      ) : (
        /* ── Quiz Mode ── */
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center">
          <div className="w-full max-w-2xl my-auto">
            {showSummary ? (
              /* Summary screen */
              <div className="bg-[#fdf6e8] rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-[#d4b87a]/50 space-y-6 animate-fade-in text-[#2d1f0e]">
                <div className="text-center space-y-2">
                  <div className="text-6xl">
                    {score === questions.length
                      ? "🏆"
                      : score >= Math.ceil(questions.length / 2)
                      ? "🌟"
                      : "💪"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2d1f0e]">
                    {score === questions.length
                      ? "ぜんもん せいかい！ すごい！"
                      : "よく がんばったね！"}
                  </h2>
                  <p className="text-4xl font-black text-pink-500">
                    {score} / {questions.length}
                  </p>
                </div>

                {/* Review all questions */}
                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const userChoice = answers[idx];
                    const isCorrect = userChoice === q.correctIndex;
                    return (
                      <div
                        key={q._id || idx}
                        className={`rounded-2xl p-4 border-2 ${
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg shrink-0">
                            {isCorrect ? "⭕" : "❌"}
                          </span>
                          <div className="space-y-1 flex-1">
                            <p className="font-bold text-sm sm:text-base text-gray-800">
                              Q{idx + 1}. {q.question}
                            </p>
                            {q.questionTranslation && (
                              <p className="text-xs text-gray-500 font-mn">
                                {q.questionTranslation}
                              </p>
                            )}
                            <p className="text-sm text-emerald-700 font-bold">
                              せいかい: {q.options[q.correctIndex]}
                            </p>
                            {!isCorrect && userChoice !== undefined && (
                              <p className="text-xs text-rose-600">
                                あなたの こたえ: {q.options[userChoice]}
                              </p>
                            )}
                            {q.explanation && (
                              <p className="text-xs text-gray-600 mt-1">
                                💡 {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-black py-3 px-6 rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    🔄 もういちど
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("read")}
                    className="bg-[#f5ecd4] hover:bg-[#ead5a8] text-[#6b4423] font-bold py-3 px-6 rounded-2xl border border-[#d4b87a] transition-all active:scale-95"
                  >
                    📖 ぶんしょうを みる
                  </button>
                  <Link
                    href="/bella-reading"
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-2xl transition-all active:scale-95"
                  >
                    ← いちらんへ
                  </Link>
                </div>
              </div>
            ) : (
              /* Active question card */
              (() => {
                const currentQ = questions[qIndex];
                const selected = answers[qIndex];
                const isAnswered = selected !== undefined;
                const isCorrect = selected === currentQ.correctIndex;

                return (
                  <div className="bg-[#fdf6e8] rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-[#d4b87a]/50 space-y-6 animate-fade-in text-[#2d1f0e]">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#a07840]">
                        <span>
                          しつもん {qIndex + 1} / {questions.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => setMode("read")}
                          className="text-pink-600 hover:underline"
                        >
                          📖 ぶんしょうを かくにん
                        </button>
                      </div>
                      <div className="h-2.5 bg-[#ead5a8]/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${((qIndex + 1) / questions.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => speak(currentQ.question)}
                        className="mt-1 shrink-0 w-10 h-10 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-600 flex items-center justify-center text-lg transition-colors active:scale-95"
                        title="Listen to question"
                      >
                        🔊
                      </button>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#2d1f0e] book-font leading-snug">
                          {currentQ.question}
                        </h2>
                        {currentQ.questionTranslation && (
                          <p className="text-sm text-[#6b4423]/75 mt-1.5 font-mn">
                            {currentQ.questionTranslation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, optIdx) => {
                        let btnStyle =
                          "bg-white hover:bg-pink-50 border-[#d4b87a]/60 hover:border-pink-400 text-[#2d1f0e]";

                        if (isAnswered) {
                          if (optIdx === currentQ.correctIndex) {
                            btnStyle =
                              "bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300";
                          } else if (optIdx === selected) {
                            btnStyle =
                              "bg-rose-100 border-rose-500 text-rose-900";
                          } else {
                            btnStyle =
                              "bg-white/60 border-gray-200 text-gray-400 opacity-70";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(optIdx)}
                            className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-base sm:text-lg transition-all active:scale-[0.99] ${btnStyle}`}
                          >
                            <span className="w-8 h-8 rounded-xl bg-[#f5ecd4] text-[#6b4423] font-black text-sm flex items-center justify-center shrink-0">
                              {OPTION_LABELS[optIdx] ?? optIdx + 1}
                            </span>
                            <span className="flex-1 book-font">{opt}</span>
                            {isAnswered && optIdx === currentQ.correctIndex && (
                              <span className="text-xl">⭕</span>
                            )}
                            {isAnswered &&
                              optIdx === selected &&
                              optIdx !== currentQ.correctIndex && (
                                <span className="text-xl">❌</span>
                              )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Next */}
                    {isAnswered && (
                      <div className="space-y-4 animate-fade-in">
                        <div
                          className={`rounded-2xl p-4 border-2 ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}
                        >
                          <p className="font-black text-base">
                            {isCorrect
                              ? "🎉 せいかい！ すごいね！"
                              : `💡 ざんねん！ せいかいは「${currentQ.options[currentQ.correctIndex]}」だよ`}
                          </p>
                          {currentQ.explanation && (
                            <p className="text-sm mt-1 opacity-90">
                              {currentQ.explanation}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black py-3.5 rounded-2xl text-lg shadow-lg transition-all active:scale-95"
                        >
                          {qIndex + 1 < questions.length
                            ? "つぎの しつもん ▶"
                            : "🏆 けっかを みる"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
