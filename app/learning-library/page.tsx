"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, NotebookText, Search, Trash2, Zap } from "lucide-react";
import { Section } from "@/components/section";
import { getNotes, deleteNote } from "@/lib/notes";
import { getBookmarks, toggleBookmark } from "@/lib/learning-memory";
import { getRecentLearning } from "@/lib/learning-memory";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type NotesList = ReturnType<typeof getNotes>;
type BookmarksList = ReturnType<typeof getBookmarks>;
type RecentList = ReturnType<typeof getRecentLearning>;

type State = {
  loaded: boolean;
  notes: NotesList;
  bookmarks: BookmarksList;
  recent: RecentList;
  query: string;
};

const INITIAL: State = {
  loaded: false,
  notes: [],
  bookmarks: [],
  recent: [],
  query: ""
};

function collect(): Omit<State, "query" | "loaded"> {
  return {
    notes: getNotes(),
    bookmarks: getBookmarks(),
    recent: getRecentLearning()
  };
}

const ghostLink =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white";

export default function LearningLibraryPage() {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    const refresh = () => setState((prev) => ({ ...prev, ...collect(), loaded: true }));
    refresh();
    window.addEventListener("codeverse-notes", refresh);
    window.addEventListener("codeverse-bookmarks", refresh);
    window.addEventListener("codeverse-learning-memory", refresh);
    return () => {
      window.removeEventListener("codeverse-notes", refresh);
      window.removeEventListener("codeverse-bookmarks", refresh);
      window.removeEventListener("codeverse-learning-memory", refresh);
    };
  }, []);

  const normalized = state.query.trim().toLowerCase();
  const filterItem = (title: string, href: string, body?: string) =>
    !normalized || `${title} ${href} ${body ?? ""}`.toLowerCase().includes(normalized);

  const notes = state.notes.filter((note) => filterItem(note.title, note.href, note.body));
  const bookmarks = state.bookmarks.filter((item) => filterItem(item.title, item.href));

  return (
    <Section
      eyebrow="My learning library"
      title="Everything you have saved"
      copy="Your notes, bookmarks and recent activity — collected in one searchable place."
    >
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={state.query}
          onChange={(event) => setState((prev) => ({ ...prev, query: event.target.value }))}
          placeholder="Search notes and bookmarks..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-brand-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Badge variant="neutral">{state.notes.length} notes</Badge>
        <Badge variant="neutral">{state.bookmarks.length} bookmarks</Badge>
        <Badge variant="neutral">{state.recent.length} recently viewed</Badge>
      </div>

      <Card className="mt-8">
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <NotebookText className="size-5 text-brand-600" />
            <h2 className="text-xl font-black text-ink dark:text-white">Your notes</h2>
          </div>

          {state.loaded && notes.length === 0 ? (
            <EmptyState
              icon={<NotebookText className="size-6" />}
              title={normalized ? "No notes match your search" : "No notes yet"}
              description={
                normalized
                  ? "Try a different search term."
                  : "Open any tutorial lesson and hit the Note button to capture ideas as you read."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="brand">{note.kind}</Badge>
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <Link href={note.href} className="mt-3 block font-black leading-5 text-ink hover:underline dark:text-white">
                      {note.title}
                    </Link>
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {note.body}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <Link href={note.href} className={ghostLink}>
                      Open lesson
                    </Link>
                    <button
                      onClick={() => {
                        deleteNote(note.href);
                        setState((prev) => ({ ...prev, notes: getNotes() }));
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:underline"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Bookmark className="size-5 text-brand-600" />
              <h2 className="text-xl font-black text-ink dark:text-white">Bookmarks</h2>
            </div>
            {state.loaded && bookmarks.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="size-6" />}
                title={normalized ? "No bookmarks match your search" : "Nothing saved yet"}
                description="Bookmark tutorials, lessons and projects to keep them here for easy access."
              />
            ) : (
              <ul className="space-y-3">
                {bookmarks.map((item) => (
                  <li key={item.href}>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <div className="min-w-0 flex-1">
                        <Link href={item.href} className="block truncate font-black text-ink hover:underline dark:text-white">
                          {item.title}
                        </Link>
                        <p className="text-xs font-bold capitalize text-slate-500">{item.kind}</p>
                      </div>
                      <button
                        onClick={() => {
                          toggleBookmark({ title: item.title, href: item.href, kind: item.kind });
                          setState((prev) => ({ ...prev, bookmarks: getBookmarks() }));
                        }}
                        className="shrink-0 text-sm font-bold text-slate-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Zap className="size-5 text-brand-600" />
              <h2 className="text-xl font-black text-ink dark:text-white">Recent activity</h2>
            </div>
            {state.loaded && state.recent.length === 0 ? (
              <EmptyState
                icon={<Zap className="size-6" />}
                title="No activity yet"
                description="Anything you open or practice will show up here so you can jump straight back in."
              />
            ) : (
              <ul className="space-y-3">
                {state.recent.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-ink dark:text-white">{item.title}</p>
                        <p className="text-xs font-bold capitalize text-slate-500">{item.kind}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-700 dark:text-cyan-300">
                        {new Date(item.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}