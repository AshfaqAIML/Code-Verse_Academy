"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import type { LibraryBookChapter } from "@/lib/books";

type ChapterBlock = {
  type: string;
  text: string;
};

type Props = {
  bookSlug: string;
  chapterSlug: string;
  onNavigate: (slug: string) => void;
};

export function ChapterViewer({ bookSlug, chapterSlug, onNavigate }: Props) {
  const [chapter, setChapter] = useState<LibraryBookChapter | null>(null);
  const [prev, setPrev] = useState<{ slug: string; title: string } | null>(null);
  const [next, setNext] = useState<{ slug: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ai-classroom/chapter-content?book=${bookSlug}&chapter=${chapterSlug}`)
      .then((r) => r.json())
      .then((data) => {
        setChapter(data.chapter);
        setPrev(data.previous);
        setNext(data.next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookSlug, chapterSlug]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-1">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Chapter {chapter.number}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">{chapter.title}</h1>
        {chapter.partTitle && (
          <p className="mt-2 text-sm font-semibold text-slate-500">Part {chapter.partNumber}: {chapter.partTitle}</p>
        )}
      </div>

      <div className="space-y-5">
        {chapter.blocks.map((block, i) => (
          <ChapterBlock key={i} block={block} />
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 py-6 dark:border-slate-800">
        {prev ? (
          <button
            onClick={() => onNavigate(prev.slug)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:-translate-x-0.5 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="size-4" /> {prev.title}
          </button>
        ) : <div />}
        {next ? (
          <button
            onClick={() => onNavigate(next.slug)}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-black text-white transition hover:translate-x-0.5 dark:bg-white dark:text-ink"
          >
            {next.title} <ArrowRight className="size-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

function ChapterBlock({ block }: { block: ChapterBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className="mt-8 text-2xl font-black tracking-tight text-ink dark:text-white">{block.text}</h2>;
    case "subheading":
      return <h3 className="mt-6 text-xl font-bold text-ink dark:text-white">{block.text}</h3>;
    case "code":
      return (
        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-100 dark:bg-slate-900">
          <code>{block.text}</code>
        </pre>
      );
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-6 text-base leading-7 text-slate-700 dark:text-slate-300">
          {block.text.split("\n").filter(Boolean).map((item, i) => (
            <li key={i}>{item.replace(/^[-*]\s*/, "")}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="rounded-2xl border-l-4 border-brand-500 bg-brand-50 p-5 text-sm leading-7 text-slate-700 dark:bg-brand-950/20 dark:text-slate-300">
          {block.text}
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            {block.text.split("\n").filter(Boolean).map((row, i) => (
              <tr key={i} className={i === 0 ? "bg-slate-100 font-bold dark:bg-slate-800" : "border-t border-slate-200 dark:border-slate-800"}>
                {row.split("|").filter(Boolean).map((cell, j) => (
                  <td key={j} className="px-4 py-3">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      );
    default:
      return <p className="text-base leading-8 text-slate-700 dark:text-slate-300">{block.text}</p>;
  }
}
