"use client";

import { BrainCircuit, CalendarClock, FileText, Flame, Layers3, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { RevisionSummary } from "@/lib/revision/types";
import { addFlashcards, getFlashcards } from "@/lib/flashcards";

export function RevisionCenter() {
  const [summaries, setSummaries] = useState<RevisionSummary[]>([]);
  const [deckCount, setDeckCount] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSummaries(JSON.parse(window.localStorage.getItem("codeverse-revision-summaries") || "[]"));
    setDeckCount(getFlashcards().length);
    const refresh = () => setDeckCount(getFlashcards().length);
    window.addEventListener("codeverse-flashcards", refresh);
    return () => window.removeEventListener("codeverse-flashcards", refresh);
  }, []);

  function importSummary(summary: RevisionSummary) {
    const { added } = addFlashcards(
      (summary.flashcards ?? []).map((fc) => ({
        front: fc.front,
        back: fc.back,
        title: summary.title,
        href: "/dashboard#revision",
        kind: "revision"
      }))
    );
    if (added > 0) setSavedIds((prev) => new Set(prev).add(summary.id));
    setDeckCount(getFlashcards().length);
  }

  function importAll() {
    const { added } = addFlashcards(
      summaries.flatMap((summary) =>
        (summary.flashcards ?? []).map((fc) => ({
          front: fc.front,
          back: fc.back,
          title: summary.title,
          href: "/dashboard#revision",
          kind: "revision"
        }))
      )
    );
    if (added > 0) setSavedIds((prev) => new Set(summaries.map((s) => s.id)));
    setDeckCount(getFlashcards().length);
  }

  const weakTopics = summaries.flatMap((summary) => summary.weakTopicPlan).slice(0, 5);
  const generatedCards = summaries.flatMap((summary) => summary.flashcards);

  return (
    <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-brand-600">Revision Center</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">AI-powered learning memory</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200">
          <Sparkles className="size-4" /> {summaries.length} saved summaries
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Saved summaries", `${summaries.length}`, FileText],
          ["Weak topics", `${weakTopics.length || 3}`, BrainCircuit],
          ["Flashcards", `${deckCount}`, Layers3],
          ["Next review", "Tomorrow", CalendarClock]
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
            <Icon className="mb-5 size-6 text-brand-600" />
            <p className="text-2xl font-black">{value as string}</p>
            <p className="text-sm font-bold text-slate-500">{label as string}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-black">Saved revision history</h3>
            {summaries.length > 0 && (
              <button
                onClick={importAll}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-ink dark:hover:bg-slate-200"
              >
                <Layers3 className="size-3.5" /> Save all {generatedCards.length} to deck
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(summaries.length ? summaries : demoSummaries).slice(0, 5).map((summary) => (
              <div key={summary.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-black">{summary.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 dark:bg-slate-900">
                    {summary.mode}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{summary.shortSummary?.[0] || "AI summary saved for revision."}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => importSummary(summary)}
                    disabled={savedIds.has(summary.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-ink dark:hover:bg-slate-200"
                  >
                    <Layers3 className="size-3.5" />
                    {savedIds.has(summary.id)
                      ? "Added to deck"
                      : `Add ${summary.flashcards?.length ?? 0} card${(summary.flashcards?.length ?? 0) === 1 ? "" : "s"} to deck`}
                  </button>
                  <span className="text-xs font-bold text-slate-400">{generatedCards.length} generated</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="mb-4 text-xl font-black">AI recommendations</h3>
          <div className="space-y-3">
            {[
              "Review weak topics before opening the next lesson.",
              "Use flashcards after 24 hours for spaced repetition.",
              "Generate deep notes before interview practice.",
              "Connect each new topic with one previous topic."
            ].map((item, index) => {
              const Icon = [Flame, Trophy, BrainCircuit, CalendarClock][index];
              return (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <Icon className="mt-1 size-5 shrink-0 text-leaf" />
                  <p className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const demoSummaries = [
  {
    id: "demo-summary",
    title: "Generate a chapter summary to fill this center",
    mode: "quick",
    shortSummary: ["Saved AI summaries will appear here with flashcards, weak topics and next review timing."]
  }
] as RevisionSummary[];
