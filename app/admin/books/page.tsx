"use client";

import { Section } from "@/components/section";

export default function AdminBooksPage() {
  return (
    <Section
      eyebrow="Content management"
      title="Books"
      copy="Full-length book content is stored as static JSON files in data/books/."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Books are loaded from <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">data/books/</code> as static JSON files.
          To add or edit a book, update the JSON files and redeploy.
        </p>
      </div>
    </Section>
  );
}
