"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ChapterBlockEditor } from "@/components/admin/chapter-block-editor";
import type { IChapterEditBlock } from "@/lib/models/ChapterEdit";

type PageParams = Promise<{ slug: string; number: string }>;

export default function ChapterEditorPage({ params }: { params: PageParams }) {
  const { slug, number } = use(params);
  const [blocks, setBlocks] = useState<IChapterEditBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch(`/api/admin/books/${slug}/chapters/${number}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.blocks) setBlocks(data.blocks);
    }
    load();
  }, [slug, number]);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch(`/api/admin/books/${slug}/chapters/${number}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved!");
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/admin/books/${slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="size-4" /> Back to chapters
      </Link>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Chapter {number}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Block editor</h1>
        </div>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm font-bold ${message === "Saved!" ? "text-green-600" : "text-red-500"}`}>
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <ChapterBlockEditor blocks={blocks} onChange={setBlocks} />
    </div>
  );
}
