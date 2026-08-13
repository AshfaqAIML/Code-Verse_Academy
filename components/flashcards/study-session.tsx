"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Check, RotateCcw } from "lucide-react";
import type { Flashcard } from "@/lib/flashcards";
import { gradeFlashcard, cardState } from "@/lib/flashcards";
import { Badge } from "@/components/ui/badge";

type Props = {
  cards: Flashcard[];
  onFinished?: () => void;
};

const stateLabel: Record<ReturnType<typeof cardState>, string> = {
  new: "New",
  learning: "Learning",
  review: "Review",
  mature: "Mature"
};

export function StudySession({ cards, onFinished }: Props) {
  const [queue, setQueue] = useState<Flashcard[]>(cards);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const current = queue[0];
  const total = cards.length;

  const remaining = useMemo(() => queue.length, [queue]);

  function handleGrade(quality: 1 | 3 | 4 | 5) {
    if (!current) return;
    gradeFlashcard(current.id, quality);
    setReviewed((value) => value + 1);

    const rest = queue.slice(1);
    if (quality < 3) {
      const retry: Flashcard = { ...current, dueAt: new Date().toISOString() };
      setQueue([...rest, retry]);
    } else {
      setQueue(rest);
    }
    setRevealed(false);

    if (rest.length === 0 && quality >= 3) {
      onFinished?.();
    }
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
          <Check className="size-6" />
        </div>
        <h3 className="text-xl font-black text-ink dark:text-white">Session complete</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          You reviewed {total} flashcard{total === 1 ? "" : "s"}. Come back when they are due to keep the memory strong.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Study session</p>
          <h3 className="mt-1 text-xl font-black text-ink dark:text-white">Review due cards</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{stateLabel[cardState(current)]}</Badge>
          <Badge variant="brand">
            {reviewed}/{total} reviewed
          </Badge>
        </div>
      </div>

      <Link
        href={current.href}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <BookOpen className="size-3.5" />
        {current.title}
      </Link>

      <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
        {!revealed ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Question</p>
            <p className="mt-3 whitespace-pre-wrap text-xl font-bold leading-8 text-ink dark:text-white">{current.front}</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-leaf">Answer</p>
            <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-800 dark:text-slate-200">{current.back}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-ink dark:hover:bg-slate-200"
          >
            <RotateCcw className="size-4" />
            Reveal answer
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGrade(1)}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-500"
            >
              Again
            </button>
            <button
              onClick={() => handleGrade(3)}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-amber-400"
            >
              Hard
            </button>
            <button
              onClick={() => handleGrade(4)}
              className="rounded-xl bg-leaf px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-500"
            >
              Good
            </button>
            <button
              onClick={() => handleGrade(5)}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-brand-500"
            >
              Easy
            </button>
          </div>
        )}

        <p className="text-sm font-bold text-slate-400">
          {remaining} left{remaining === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}