"use client";

import { useEffect, useRef, useState } from "react";
import { Layers3, Trash2 } from "lucide-react";
import { addFlashcard, deleteFlashcard, getFlashcards } from "@/lib/flashcards";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  href: string;
  kind: string;
};

export function CreateFlashcard({ title, href, kind }: Props) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedCount(getFlashcards().filter((card) => card.href === href).length);
  }, [href]);

  useEffect(() => {
    const refresh = () => setSavedCount(getFlashcards().filter((card) => card.href === href).length);
    window.addEventListener("codeverse-flashcards", refresh);
    return () => window.removeEventListener("codeverse-flashcards", refresh);
  }, [href]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
    }
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleSave() {
    if (!front.trim() || !back.trim()) return;
    addFlashcard({ title, href, kind, front, back });
    setFront("");
    setBack("");
    setSavedCount(getFlashcards().filter((card) => card.href === href).length);
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button variant="secondary" size="md" onClick={() => setOpen((value) => !value)}>
        <Layers3 className="size-4" />
        Flashcard
      </Button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-black text-ink dark:text-white">
              New flashcard <span className="font-bold text-slate-400">({savedCount} saved here)</span>
            </p>
            {savedCount > 0 ? (
              <button
                onClick={() => {
                  getFlashcards()
                    .filter((card) => card.href === href)
                    .forEach((card) => deleteFlashcard(card.id));
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
              >
                <Trash2 className="size-3.5" />
                Remove all
              </button>
            ) : null}
          </div>

          <label className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Question</label>
          <textarea
            value={front}
            onChange={(event) => setFront(event.target.value)}
            rows={2}
            placeholder="What is the key idea to recall?"
            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <label className="mb-1 mt-3 block text-xs font-black uppercase tracking-[0.14em] text-slate-500">Answer</label>
          <textarea
            value={back}
            onChange={(event) => setBack(event.target.value)}
            rows={3}
            placeholder="The concise answer or code snippet."
            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={!front.trim() || !back.trim()}>
              Save flashcard
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}