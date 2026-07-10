"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink, Database, AlertCircle } from "lucide-react";
import { Section } from "@/components/section";

type TutorialSummary = {
  _id: string;
  slug: string;
  title: string;
  category?: string;
  level?: string;
  lessons?: number;
  updatedAt: string;
};

export default function AdminTutorialsPage() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState<TutorialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrating, setMigrating] = useState(false);

  async function fetchTutorials() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/tutorials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status === 403 ? "Unauthorized" : "Failed to fetch");
      const data = await res.json();
      setTutorials(data.tutorials);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTutorials(); }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete tutorial "${slug}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch(`/api/admin/tutorials/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setTutorials((prev) => prev.filter((t) => t.slug !== slug));
    } catch (e) {
      alert(String(e));
    }
  }

  async function handleMigrate() {
    if (!confirm("Import existing tutorial content from the codebase into MongoDB?")) return;
    setMigrating(true);
    try {
      const token = localStorage.getItem("codeverse-token");
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tutorials" }),
      });
      if (!res.ok) throw new Error("Migration failed");
      alert("Migration complete! Refreshing list...");
      fetchTutorials();
    } catch (e) {
      alert(String(e));
    } finally {
      setMigrating(false);
    }
  }

  return (
    <Section
      eyebrow="Content management"
      title="Tutorials"
      copy="Create, edit, and manage tutorial course content."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push("/admin/tutorials/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink"
        >
          <Plus className="size-4" /> New tutorial
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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading tutorials...
        </div>
      ) : tutorials.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">No tutorials found.</p>
          <p className="mt-1 text-xs text-slate-400">Click &ldquo;Import from codebase&rdquo; to load existing content, or &ldquo;New tutorial&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 font-bold">Title</th>
                <th className="px-5 py-4 font-bold">Slug</th>
                <th className="px-5 py-4 font-bold">Category</th>
                <th className="px-5 py-4 font-bold">Level</th>
                <th className="px-5 py-4 font-bold">Lessons</th>
                <th className="px-5 py-4 font-bold">Updated</th>
                <th className="px-5 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tutorials.map((t) => (
                <tr key={t._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-5 py-4 font-semibold">{t.title}</td>
                  <td className="px-5 py-4 text-slate-500">{t.slug}</td>
                  <td className="px-5 py-4">{t.category ?? "—"}</td>
                  <td className="px-5 py-4">{t.level ?? "—"}</td>
                  <td className="px-5 py-4">{t.lessons ?? "—"}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/tutorials/${t.slug}`)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <a
                        href={`/courses/${t.slug}/watch`}
                        target="_blank"
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(t.slug)}
                        className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 dark:border-red-900"
                      >
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
