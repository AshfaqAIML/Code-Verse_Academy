"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, ArrowLeft, Loader2, GripVertical } from "lucide-react";

type Block = { type: "paragraph" | "list" | "pre" | "heading"; text: string; level?: number };

type BlogData = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  blocks: Block[];
  published: boolean;
};

const emptyBlog: BlogData = {
  slug: "", title: "", category: "General", excerpt: "",
  blocks: [{ type: "paragraph", text: "" }], published: true,
};

export function BlogEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isNew = !slug;
  const [data, setData] = useState<BlogData>(emptyBlog);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const token = localStorage.getItem("codeverse-token");
    fetch(`/api/admin/blogs/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.blog) setData(res.blog);
        else setError("Not found");
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const update = useCallback(<K extends keyof BlogData>(key: K, value: BlogData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  function addBlock() { setData((p) => ({ ...p, blocks: [...p.blocks, { type: "paragraph" as const, text: "" }] })); }
  function removeBlock(i: number) { setData((p) => ({ ...p, blocks: p.blocks.filter((_, idx) => idx !== i) })); }
  function updateBlock(i: number, field: keyof Block, value: string | number) {
    setData((p) => {
      const blocks = [...p.blocks];
      blocks[i] = { ...blocks[i], [field]: value };
      return { ...p, blocks };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("codeverse-token");
    const payload = {
      ...data,
      blocks: data.blocks.filter((b) => b.text.trim()),
    };

    try {
      const url = isNew ? "/api/admin/blogs" : `/api/admin/blogs/${slug}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Save failed");
      }
      const saved = await res.json();
      router.push(`/admin/blogs/${saved.blog?.slug ?? saved.blog.slug}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin/blogs")} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700">
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">{isNew ? "New article" : "Edit article"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isNew ? "Create a new blog post" : `Editing: ${data.slug}`}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</div>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-5 text-lg font-black">Article info</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Title</span>
              <input type="text" value={data.title} onChange={(e) => update("title", e.target.value)} placeholder="Article title" className="w-full text-lg" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Slug</span>
                <input type="text" value={data.slug} onChange={(e) => update("slug", e.target.value)} placeholder="article-slug" className="w-full font-mono text-sm" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Category</span>
                <input type="text" value={data.category} onChange={(e) => update("category", e.target.value)} placeholder="JavaScript, SQL, etc." className="w-full" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">Excerpt</span>
              <textarea rows={2} value={data.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="Brief article summary" className="w-full" />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={data.published} onChange={(e) => update("published", e.target.checked)} className="size-4" />
              Published
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black">Content blocks</h2>
            <button onClick={addBlock} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              <Plus className="size-4" /> Add block
            </button>
          </div>
          <div className="space-y-4">
            {data.blocks.map((block, i) => (
              <div key={i} className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-3 flex items-center justify-between">
                  <select value={block.type} onChange={(e) => updateBlock(i, "type", e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
                    <option value="paragraph">Paragraph</option>
                    <option value="heading">Heading</option>
                    <option value="list">List item</option>
                    <option value="pre">Code/pre</option>
                  </select>
                  <div className="flex items-center gap-2">
                    {block.type === "heading" && (
                      <select value={block.level ?? 2} onChange={(e) => updateBlock(i, "level", Number(e.target.value))} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800">
                        <option value={2}>H2</option>
                        <option value={3}>H3</option>
                      </select>
                    )}
                    <button onClick={() => removeBlock(i)} className="rounded-lg p-1 text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-950">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                {block.type === "pre" ? (
                  <textarea rows={5} value={block.text} onChange={(e) => updateBlock(i, "text", e.target.value)} placeholder="Code content..." className="w-full font-mono text-sm" />
                ) : (
                  <textarea rows={block.type === "heading" ? 1 : 3} value={block.text} onChange={(e) => updateBlock(i, "text", e.target.value)} placeholder={block.type === "list" ? "List item text..." : block.type === "heading" ? "Heading text..." : "Paragraph text..."} className="w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
        <button onClick={() => router.push("/admin/blogs")} className="text-sm font-semibold text-slate-500 transition hover:text-ink">Back to articles</button>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
