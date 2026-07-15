"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink, Database, AlertCircle } from "lucide-react";
import { Section } from "@/components/section";

type BlogSummary = {
  slug: string;
  title: string;
  category: string;
  readingTime: number;
  published: boolean;
  updatedAt?: string;
};

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrating, setMigrating] = useState(false);

  async function fetchBlogs() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/blogs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBlogs(data.blogs);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBlogs(); }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    try {
      const token = localStorage.getItem("codeverse-token");
      await fetch(`/api/admin/blogs/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
    } catch (e) {
      alert(String(e));
    }
  }

  async function handleMigrate() {
    if (!confirm("Import existing blog articles from the codebase?")) return;
    setMigrating(true);
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blogs" }),
      });
      if (!res.ok) throw new Error("Migration failed");
      alert("Migration complete!");
      fetchBlogs();
    } catch (e) {
      alert(String(e));
    } finally {
      setMigrating(false);
    }
  }

  return (
    <Section
      eyebrow="Content management"
      title="Blog articles"
      copy="Create and edit blog posts."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push("/admin/blogs/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink"
        >
          <Plus className="size-4" /> New article
        </button>
        <button
          onClick={handleMigrate}
          disabled={migrating}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <Database className="size-4" />
          {migrating ? "Importing..." : "Import from codebase"}
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">No blog articles found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold">Title</th>
                <th className="px-5 py-4 font-bold">Category</th>
                <th className="px-5 py-4 font-bold">Read time</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold">Updated</th>
                <th className="px-5 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {blogs.map((b) => (
                <tr key={b.slug} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-5 py-4 font-semibold">{b.title}</td>
                  <td className="px-5 py-4">{b.category}</td>
                  <td className="px-5 py-4">{b.readingTime} min</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${b.published ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                      {b.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/admin/blogs/${b.slug}`)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700">
                        <Pencil className="size-4" />
                      </button>
                      <a href={`/blog/${b.slug}`} target="_blank" className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700">
                        <ExternalLink className="size-4" />
                      </a>
                      <button onClick={() => handleDelete(b.slug)} className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 dark:border-red-900">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
