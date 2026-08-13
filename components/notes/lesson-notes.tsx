"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, StickyNote, Trash2 } from "lucide-react";
import { deleteNote, getNoteForHref, saveNote } from "@/lib/notes";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  href: string;
  kind: string;
};

export function LessonNotes({ title, href, kind }: Props) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [hasNote, setHasNote] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const note = getNoteForHref(href);
    setBody(note?.body ?? "");
    setHasNote(Boolean(note));
  }, [href]);

  useEffect(() => {
    const refresh = () => {
      const note = getNoteForHref(href);
      setBody(note?.body ?? "");
      setHasNote(Boolean(note));
    };
    window.addEventListener("codeverse-notes", refresh);
    return () => window.removeEventListener("codeverse-notes", refresh);
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
    saveNote({ title, href, kind, body });
    setHasNote(body.trim().length > 0);
  }

  function handleDelete() {
    deleteNote(href);
    setBody("");
    setHasNote(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button variant="secondary" size="md" onClick={() => setOpen((value) => !value)}>
        <StickyNote className="size-4" />
        {hasNote ? "Edit note" : "Note"}
      </Button>

      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2">
            <NotebookPen className="size-4 text-brand-600" />
            <p className="text-sm font-black text-ink dark:text-white">Notes for this lesson</p>
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={5}
            placeholder="Capture key ideas, gotchas, or code snippets here..."
            className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button size="sm" onClick={handleSave}>
              {hasNote ? "Update note" : "Save note"}
            </Button>
            {hasNote ? (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:underline"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}