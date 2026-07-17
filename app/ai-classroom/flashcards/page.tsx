"use client";

import { useState, useEffect, useCallback } from "react";
import { NotebookTabs, Loader2, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Rotate3D, BarChart3 } from "lucide-react";
import type { Flashcard } from "@/lib/ai-classroom/generation/types";

const CARD_COUNTS = [5, 10, 20];

export default function FlashcardsPage() {
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function generateFlashcards() {
    if (!chapterContent.trim()) return;
    setLoading(true);
    setError("");
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCount(0);

    try {
      const res = await fetch("/api/ai-classroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flashcard",
          chapterContent: chapterContent.slice(0, 5000),
          chapterTitle: chapterTitle || "Lesson",
          count: cardCount,
        }),
      });
      const data = await res.json();
      if (data.success) setCards(data.data);
      else setError("Failed to generate flashcards. Try different content.");
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function flipCard() {
    if (animating) return;
    setAnimating(true);
    setFlipped((f) => !f);
    setTimeout(() => setAnimating(false), 400);
  }

  function goPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  }

  function goNext() {
    setCurrentIndex((i) => Math.min(cards.length - 1, i + 1));
    setFlipped(false);
  }

  function markKnown() {
    if (!flipped) return;
    setKnownCount((n) => n + 1);
    if (currentIndex < cards.length - 1) goNext();
  }

  function shuffle() {
    setCards((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCount(0);
  }

  function restart() {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCount(0);
  }

  const currentCard = cards[currentIndex];

  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3">
            <NotebookTabs className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">Flashcards</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-generated flashcards for quick revision</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {cards.length === 0 && !loading && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              placeholder="Chapter title (optional)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
            />
            <textarea
              placeholder="Paste your lesson/chapter content here..."
              className="h-48 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800"
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Cards:</span>
              {CARD_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCardCount(n)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    cardCount === n
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={generateFlashcards}
              disabled={!chapterContent.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <NotebookTabs className="size-4" />}
              {loading ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-brand-600" />
          </div>
        )}

        {cards.length > 0 && currentCard && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-500">{currentIndex + 1} / {cards.length}</p>
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={shuffle} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                  <Shuffle className="size-3" /> Shuffle
                </button>
                <button onClick={restart} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                  <RotateCcw className="size-3" /> Restart
                </button>
                <button onClick={() => { setCards([]); setFlipped(false); }} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                  <NotebookTabs className="size-3" /> New
                </button>
              </div>
            </div>

            <div className="perspective-1000" onClick={flipCard}>
              <div className={`relative min-h-[300px] cursor-pointer transition-transform duration-400 ${
                flipped ? "[transform:rotateY(180deg)]" : ""
              }`} style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute inset-0 rounded-3xl border-2 border-slate-200 bg-white p-8 text-center backface-hidden dark:border-slate-700 dark:bg-slate-900" style={{ backfaceVisibility: "hidden" }}>
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Question</p>
                    <p className="text-2xl font-black leading-relaxed">{currentCard.front}</p>
                    {currentCard.topic && <p className="text-sm text-slate-400">{currentCard.topic}</p>}
                    <p className="mt-4 text-xs text-slate-400">Click or press Space to flip</p>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-3xl border-2 border-brand-400 bg-gradient-to-br from-brand-50 to-purple-50 p-8 text-center backface-hidden dark:from-brand-900/20 dark:to-purple-900/20" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Answer</p>
                    <p className="text-xl leading-relaxed">{currentCard.back}</p>
                  </div>
                </div>
              </div>
            </div>

            {flipped && (
              <div className="flex justify-center">
                <button onClick={markKnown} className="rounded-xl bg-emerald-500 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-600">
                  Mark as Known ({knownCount})
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="size-5" /> Previous
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === cards.length - 1}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Next <ChevronRight className="size-5" />
              </button>
            </div>

            <p className="text-center text-xs text-slate-400">
              Left/Right arrows to navigate · Space/Enter to flip
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
