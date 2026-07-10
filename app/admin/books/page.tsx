"use client";

import { useEffect, useState } from "react";
import { Database, AlertCircle, ExternalLink } from "lucide-react";
import { Section } from "@/components/section";

type BookSummary = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  level: string;
  source?: string;
  updatedAt: string;
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrating, setMigrating] = useState(false);

  async function fetchBooks() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/tutorials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBooks(); }, []);

  async function handleMigrate() {
    if (!confirm("Import all books from the codebase into MongoDB? This may take a moment.")) return;
    setMigrating(true);
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "books" }),
      });
      if (!res.ok) throw new Error("Migration failed");
      const result = await res.json();
      alert(`Imported ${result.migrated.books} books!`);
    } catch (e) {
      alert(String(e));
    } finally {
      setMigrating(false);
    }
  }

  return (
    <Section
      eyebrow="Content management"
      title="Books"
      copy="Manage full-length book content. Books are large — use the import tool to load them from the codebase into MongoDB."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleMigrate}
          disabled={migrating}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
        >
          <Database className="size-4" />
          {migrating ? "Importing..." : "Import all books from codebase"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Books are imported from JSON files in <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">data/books/</code>. 
            Click the import button above to load them into MongoDB for editing via the admin panel.
            Full book content editing is available after import.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            You can also edit book JSON files directly in the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">data/books/</code> directory and re-import.
          </p>
        </div>
      )}
    </Section>
  );
}
