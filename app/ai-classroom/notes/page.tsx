"use client";

import { useState, useEffect } from "react";
import { PenLine, Loader2, Plus, Trash2, Download, Edit3, Save, Search, FileText, Copy } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  source: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "cv-ai-notes";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {}
}

export default function AINotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    if (notes.length > 0) saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    setSaved(activeNote ? activeNote.title === title && activeNote.content === content && activeNote.source === source : true);
  }, [title, content, source, activeNote]);

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()),
  );

  function createNote() {
    const note: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled Note",
      content: "",
      source: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSource(note.source);
    setEditing(true);
    setSaved(true);
  }

  function duplicateNote() {
    if (!activeNote) return;
    const note: Note = {
      id: `note-${Date.now()}`,
      title: activeNote.title + " (copy)",
      content: activeNote.content,
      source: activeNote.source,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSource(note.source);
    setEditing(true);
    setSaved(true);
  }

  function selectNote(note: Note) {
    if (!saved && activeNote) saveCurrent();
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setSource(note.source);
    setEditing(false);
    setSaved(true);
  }

  function saveCurrent() {
    if (!activeNote) return;
    const updated: Note = {
      ...activeNote,
      title: title || "Untitled Note",
      content,
      source,
      updatedAt: Date.now(),
    };
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? updated : n)));
    setActiveNote(updated);
    setEditing(false);
    setSaved(true);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) {
      setActiveNote(null);
      setTitle("");
      setContent("");
      setSource("");
    }
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function wordCount(text: string) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  async function generateNotes() {
    if (!source.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-classroom/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quiz",
          chapterContent: source.slice(0, 3000),
          chapterTitle: title || "Notes",
          count: 3,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.questions) {
        const summary = data.data.questions
          .map((q: { question: string; explanation: string }) => `• ${q.question}\n  ${q.explanation}`)
          .join("\n\n");
        setContent(`## Key Concepts\n\n${summary}`);
        setSaved(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function exportNotes() {
    const all = notes.map((n) => `# ${n.title}\n\n${n.content}\n\n---`).join("\n\n");
    const blob = new Blob([all], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-notes-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 p-3">
              <PenLine className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Notes</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Auto-generated structured notes with key concepts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportNotes} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              <Download className="size-4" /> Export
            </button>
            <button onClick={createNote} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:from-violet-600 hover:to-purple-700">
              <Plus className="size-4" /> New Note
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full shrink-0 lg:w-72">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
              {filteredNotes.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  {search ? "No notes match your search." : "No notes yet. Create one above."}
                </p>
              )}
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    activeNote?.id === note.id
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <p className="text-sm font-black truncate">{note.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(note.updatedAt)}</p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            {!activeNote ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PenLine className="size-16 text-slate-300" />
                <p className="mt-4 text-lg font-black text-slate-400">Select or create a note</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {editing ? (
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-black outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  ) : (
                    <h2 className="text-2xl font-black">{activeNote.title}</h2>
                  )}
                  <div className="flex items-center gap-2">
                    {!saved && (
                      <span className="text-xs font-bold text-amber-500">Unsaved</span>
                    )}
                    <button
                      onClick={duplicateNote}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <Copy className="size-3" /> Duplicate
                    </button>
                    <button
                      onClick={editing ? saveCurrent : () => setEditing(true)}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {editing ? <Save className="size-4" /> : <Edit3 className="size-4" />}
                      {editing ? "Save" : "Edit"}
                    </button>
                  </div>
                </div>

                <textarea
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Paste source content here to generate notes from AI..."
                  className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800"
                  disabled={!editing}
                />

                {source && (
                  <button
                    onClick={generateNotes}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:from-violet-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <PenLine className="size-4" />}
                    {loading ? "Generating..." : "Generate Notes from Content"}
                  </button>
                )}

                {editing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-96 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-800 font-mono"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-300">
                    {activeNote.content || "No content yet."}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>Created {formatDate(activeNote.createdAt)}</span>
                    <span>{wordCount(content)} words</span>
                  </div>
                  <button onClick={() => deleteNote(activeNote.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700">
                    <Trash2 className="size-3" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
