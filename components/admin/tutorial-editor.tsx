"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, ArrowLeft, Loader2, GripVertical } from "lucide-react";

type Section = { heading: string; body: string };
type QuizItem = { question: string; answer: string };
type OutlinePart = { part: string; chapters: string[] };

type TutorialData = {
  slug: string;
  title: string;
  category: string;
  level: string;
  lessons: number;
  description: string;
  chapters: string[];
  color: string;
  certificate: boolean;
  overview: string;
  sections: Section[];
  example: string;
  practice: string[];
  quiz: QuizItem[];
  outline: OutlinePart[];
};

const emptyTutorial: TutorialData = {
  slug: "", title: "", category: "Programming", level: "Beginner", lessons: 0,
  description: "", chapters: [], color: "from-blue-400 to-indigo-600", certificate: true,
  overview: "", sections: [{ heading: "", body: "" }], example: "",
  practice: [""], quiz: [{ question: "", answer: "" }], outline: [],
};

export function TutorialEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const isNew = !slug;
  const [data, setData] = useState<TutorialData>(emptyTutorial);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const token = localStorage.getItem("codeverse-token");
    fetch(`/api/admin/tutorials/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.tutorial) setData(res.tutorial);
        else setError("Not found");
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const update = useCallback(<K extends keyof TutorialData>(key: K, value: TutorialData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  function addSection() { setData((p) => ({ ...p, sections: [...p.sections, { heading: "", body: "" }] })); }
  function removeSection(i: number) { setData((p) => ({ ...p, sections: p.sections.filter((_, idx) => idx !== i) })); }
  function updateSection(i: number, field: keyof Section, value: string) {
    setData((p) => {
      const sections = [...p.sections];
      sections[i] = { ...sections[i], [field]: value };
      return { ...p, sections };
    });
  }

  function addPractice() { setData((p) => ({ ...p, practice: [...p.practice, ""] })); }
  function removePractice(i: number) { setData((p) => ({ ...p, practice: p.practice.filter((_, idx) => idx !== i) })); }
  function updatePractice(i: number, value: string) {
    setData((p) => {
      const practice = [...p.practice];
      practice[i] = value;
      return { ...p, practice };
    });
  }

  function addQuiz() { setData((p) => ({ ...p, quiz: [...p.quiz, { question: "", answer: "" }] })); }
  function removeQuiz(i: number) { setData((p) => ({ ...p, quiz: p.quiz.filter((_, idx) => idx !== i) })); }
  function updateQuiz(i: number, field: keyof QuizItem, value: string) {
    setData((p) => {
      const quiz = [...p.quiz];
      quiz[i] = { ...quiz[i], [field]: value };
      return { ...p, quiz };
    });
  }

  function addOutlinePart() { setData((p) => ({ ...p, outline: [...p.outline, { part: "", chapters: [""] }] })); }
  function removeOutlinePart(i: number) { setData((p) => ({ ...p, outline: p.outline.filter((_, idx) => idx !== i) })); }
  function updateOutlinePart(i: number, value: string) {
    setData((p) => {
      const outline = [...p.outline];
      outline[i] = { ...outline[i], part: value };
      return { ...p, outline };
    });
  }
  function addChapterToOutline(i: number) {
    setData((p) => {
      const outline = [...p.outline];
      outline[i] = { ...outline[i], chapters: [...outline[i].chapters, ""] };
      return { ...p, outline };
    });
  }
  function removeChapterFromOutline(partIdx: number, chIdx: number) {
    setData((p) => {
      const outline = [...p.outline];
      outline[partIdx] = { ...outline[partIdx], chapters: outline[partIdx].chapters.filter((_, idx) => idx !== chIdx) };
      return { ...p, outline };
    });
  }
  function updateOutlineChapter(partIdx: number, chIdx: number, value: string) {
    setData((p) => {
      const outline = [...p.outline];
      const chs = [...outline[partIdx].chapters];
      chs[chIdx] = value;
      outline[partIdx] = { ...outline[partIdx], chapters: chs };
      return { ...p, outline };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const token = localStorage.getItem("codeverse-token");
    const payload = {
      ...data,
      sections: (data.sections ?? []).filter((s) => s.heading || s.body),
      practice: (data.practice ?? []).filter((s) => s.trim()),
      quiz: (data.quiz ?? []).filter((q) => q.question || q.answer),
      outline: (data.outline ?? []).map((o) => ({ ...o, chapters: (o.chapters ?? []).filter((c) => c.trim()) })).filter((o) => o.part),
    };

    try {
      const url = isNew ? "/api/admin/tutorials" : `/api/admin/tutorials/${slug}`;
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
      router.push(`/admin/tutorials/${saved.tutorial?.slug ?? saved.tutorial.slug}`);
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
          <button onClick={() => router.push("/admin/tutorials")} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700">
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black">{isNew ? "New tutorial" : "Edit tutorial"}</h1>
            <p className="mt-1 text-sm text-slate-500">{isNew ? "Create a new course" : `Editing: ${data.slug}`}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <FieldSet title="Basic info">
          <Field label="Title"><input type="text" value={data.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. JavaScript Mastery" className="w-full" /></Field>
          <Field label="Slug"><input type="text" value={data.slug} onChange={(e) => update("slug", e.target.value)} placeholder="e.g. javascript-mastery" className="w-full font-mono text-sm" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category">
              <select value={data.category} onChange={(e) => update("category", e.target.value)} className="w-full">
                {["Web", "Programming", "DSA", "Data", "AI/ML", "Backend", "Interview"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Level">
              <select value={data.level} onChange={(e) => update("level", e.target.value)} className="w-full">
                {["Beginner", "Beginner to Advanced", "Intermediate", "Advanced"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Lessons">
              <input type="number" value={data.lessons} onChange={(e) => update("lessons", Number(e.target.value))} className="w-full" />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} value={data.description} onChange={(e) => update("description", e.target.value)} placeholder="Short course description" className="w-full" />
          </Field>
          <Field label="Chapters (comma-separated)">
            <input type="text" value={(data.chapters ?? []).join(", ")} onChange={(e) => update("chapters", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="HTML, CSS, JavaScript" className="w-full" />
          </Field>
          <div className="flex items-center gap-3">
            <Field label="Gradient color">
              <input type="text" value={data.color} onChange={(e) => update("color", e.target.value)} placeholder="from-blue-400 to-indigo-600" className="w-full font-mono text-sm" />
            </Field>
            <label className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={data.certificate} onChange={(e) => update("certificate", e.target.checked)} className="size-4" />
              Certificate available
            </label>
          </div>
        </FieldSet>

        <FieldSet title="Content">
          <Field label="Overview">
            <textarea rows={4} value={data.overview} onChange={(e) => update("overview", e.target.value)} className="w-full" />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Sections</span>
              <button onClick={addSection} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                <Plus className="size-4" /> Add section
              </button>
            </div>
            {(data.sections ?? []).map((s, i) => (
              <div key={i} className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <button onClick={() => removeSection(i)} className="absolute right-3 top-3 hidden rounded-lg p-1 text-red-500 hover:bg-red-50 group-hover:block dark:hover:bg-red-950">
                  <Trash2 className="size-4" />
                </button>
                <input type="text" value={s.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} placeholder="Section heading" className="mb-2 w-full text-sm font-bold" />
                <textarea rows={3} value={s.body} onChange={(e) => updateSection(i, "body", e.target.value)} placeholder="Section body content" className="w-full text-sm" />
              </div>
            ))}
          </div>

          <Field label="Example">
            <textarea rows={3} value={data.example} onChange={(e) => update("example", e.target.value)} className="w-full" />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Practice tasks</span>
              <button onClick={addPractice} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                <Plus className="size-4" /> Add task
              </button>
            </div>
            {(data.practice ?? []).map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={p} onChange={(e) => updatePractice(i, e.target.value)} placeholder="e.g. Create a counter" className="flex-1 text-sm" />
                <button onClick={() => removePractice(i)} className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </FieldSet>

        <FieldSet title="Quiz">
          {(data.quiz ?? []).map((q, i) => (
            <div key={i} className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <button onClick={() => removeQuiz(i)} className="absolute right-3 top-3 hidden rounded-lg p-1 text-red-500 hover:bg-red-50 group-hover:block dark:hover:bg-red-950">
                <Trash2 className="size-4" />
              </button>
              <input type="text" value={q.question} onChange={(e) => updateQuiz(i, "question", e.target.value)} placeholder="Question" className="mb-2 w-full text-sm font-bold" />
              <textarea rows={2} value={q.answer} onChange={(e) => updateQuiz(i, "answer", e.target.value)} placeholder="Answer" className="w-full text-sm" />
            </div>
          ))}
          <button onClick={addQuiz} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            <Plus className="size-4" /> Add question
          </button>
        </FieldSet>

        <FieldSet title="Outline (optional, for structured courses)">
          {(data.outline ?? []).map((part, pi) => (
            <div key={pi} className="group relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <button onClick={() => removeOutlinePart(pi)} className="absolute right-3 top-3 hidden rounded-lg p-1 text-red-500 hover:bg-red-50 group-hover:block dark:hover:bg-red-950">
                <Trash2 className="size-4" />
              </button>
              <input type="text" value={part.part} onChange={(e) => updateOutlinePart(pi, e.target.value)} placeholder="e.g. Part I - Foundations" className="mb-3 w-full text-sm font-bold" />
              <div className="space-y-2 pl-2">
                {part.chapters.map((ch, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-slate-300" />
                    <input type="text" value={ch} onChange={(e) => updateOutlineChapter(pi, ci, e.target.value)} placeholder="Chapter title" className="flex-1 text-sm" />
                    <button onClick={() => removeChapterFromOutline(pi, ci)} className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addChapterToOutline(pi)} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
                  <Plus className="size-3" /> Add chapter
                </button>
              </div>
            </div>
          ))}
          <button onClick={addOutlinePart} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            <Plus className="size-4" /> Add part
          </button>
        </FieldSet>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
        <button onClick={() => router.push("/admin/tutorials")} className="text-sm font-semibold text-slate-500 transition hover:text-ink">
          Back to tutorials
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-ink"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function FieldSet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-5 text-lg font-black">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
