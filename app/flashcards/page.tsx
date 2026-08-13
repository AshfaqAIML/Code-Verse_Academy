"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers3, Play, RotateCcw, Trash2 } from "lucide-react";
import { Section } from "@/components/section";
import {
  cardState,
  deleteFlashcard,
  formatDue,
  getDueCount,
  getDueFlashcards,
  getFlashcards,
  resetFlashcard,
  type Flashcard
} from "@/lib/flashcards";
import { StudySession } from "@/components/flashcards/study-session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type Deck = Flashcard[];

const stateBadge: Record<ReturnType<typeof cardState>, "default" | "brand" | "warning" | "success" | "neutral"> = {
  new: "brand",
  learning: "warning",
  review: "default",
  mature: "success"
};

const stateLabel = {
  new: "New",
  learning: "Learning",
  review: "Review",
  mature: "Mature"
};

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<Deck>([]);
  const [loaded, setLoaded] = useState(false);
  const [studying, setStudying] = useState(false);
  const [due, setDue] = useState<Deck>([]);

  const refresh = () => {
    setDeck(getFlashcards());
    setDue(getDueFlashcards());
    setLoaded(true);
  };

  useEffect(() => {
    refresh();
    window.addEventListener("codeverse-flashcards", refresh);
    return () => window.removeEventListener("codeverse-flashcards", refresh);
  }, []);

  const total = deck.length;
  const mature = deck.filter((card) => cardState(card) === "mature").length;
  const learning = deck.filter((card) => cardState(card) === "learning" || cardState(card) === "new").length;

  return (
    <Section
      eyebrow="Spaced repetition"
      title="Flashcards"
      copy="Review due cards, then let the SM-2 scheduler space out your reviews so the knowledge sticks."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Due now", String(due.length)],
          ["Learning / new", String(learning)],
          ["Mature", String(mature)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-3xl font-black text-ink dark:text-white">{value}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setDue(getDueFlashcards());
            setStudying(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          disabled={due.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-leaf px-5 py-2.5 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          <Play className="size-4" />
          Start review ({due.length})
        </button>
        {studying ? (
          <button
            onClick={() => setStudying(false)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Exit review
          </button>
        ) : null}
      </div>

      {studying && due.length > 0 ? (
        <div className="mt-6">
          <StudySession
            cards={due}
            onFinished={() => {
              setStudying(false);
              refresh();
            }}
          />
        </div>
      ) : null}

      <Card className="mt-8">
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Layers3 className="size-5 text-brand-600" />
            <h2 className="text-xl font-black text-ink dark:text-white">Your deck ({total})</h2>
          </div>

          {loaded && deck.length === 0 ? (
            <EmptyState
              icon={<Layers3 className="size-6" />}
              title="No flashcards yet"
              description="Open any tutorial lesson and hit the Flashcard button to save questions as you read. They appear here for spaced review."
            />
          ) : (
            <div className="space-y-3">
              {deck.map((card) => (
                <div
                  key={card.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={stateBadge[cardState(card)]}>{stateLabel[cardState(card)]}</Badge>
                      <span className="text-xs font-bold text-slate-500">{formatDue(card)}</span>
                      <span className="text-xs font-bold text-slate-400">interval {card.intervalDays}d · ease {card.ease.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => resetFlashcard(card.id)}
                        aria-label="Reset schedule"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <RotateCcw className="size-4" />
                      </button>
                      <button
                        onClick={() => deleteFlashcard(card.id)}
                        aria-label="Delete flashcard"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-red-600 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-base font-bold leading-6 text-ink dark:text-white">{card.front}</p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">{card.back}</p>
                  <Link
                    href={card.href}
                    className="mt-3 inline-block text-xs font-bold text-brand-700 hover:underline dark:text-cyan-300"
                  >
                    {card.title}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}