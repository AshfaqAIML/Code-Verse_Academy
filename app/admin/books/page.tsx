"use client";

import { useEffect, useState } from "react";
import { BookOpen, Database, AlertCircle } from "lucide-react";
import { Section } from "@/components/section";

type BookSummary = {
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  chapters: number;
};

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function fetchBooks() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBooks(data.books);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBooks(); }, []);

  async function handleMigrate() {
    if (!confirm("Import all books into the database? Static JSON files will be synced to MongoDB.")) return;
    setMigrating(true);
    setResult("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "migrate" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Migration failed (${res.status})`);
      }
      const data = await res.json();
      setResult(`Imported ${data.imported} books to MongoDB.`);
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
      copy="Full-length books stored as static JSON files in data/books/"
    >
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {books.length} books in library
        </p>
        <button
          onClick={handleMigrate}
          disabled={migrating}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <Database className="size-4" />
          {migrating ? "Importing..." : "Import to MongoDB"}
        </button>
      </div>

      {result && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {result}
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading books...
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">No books found in library.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Chapters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {books.map((book) => (
                <tr key={book.slug} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-4 shrink-0 text-slate-400" />
                      {book.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{book.slug}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{book.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{book.level}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{book.chapters}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
