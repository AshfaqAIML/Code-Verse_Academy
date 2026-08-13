import registry from "@/data/books/registry.json";
import { getRecentLearning, getBookmarks } from "@/lib/learning-memory";
import { getPracticeDates, getCompletedCount } from "@/lib/stats";
import { getDueCount } from "@/lib/flashcards";
import type { BookProgressRecord } from "@/lib/book-progress";

type RegistryEntry = { slug: string; title: string; level: string; category: string };

const books = registry as RegistryEntry[];

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function getAllBookProgress(): Record<string, BookProgressRecord> {
  const storage = getStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem("codeverse-book-progress");
    return raw ? (JSON.parse(raw) as Record<string, BookProgressRecord>) : {};
  } catch {
    return {};
  }
}

export type SkillBar = { label: string; progress: number };

export function computeSkillBars(): SkillBar[] {
  const progress = getAllBookProgress();
  const agg = new Map<string, { total: number; sum: number }>();
  for (const entry of Object.values(progress)) {
    const category = books.find((b) => b.slug === entry.bookSlug)?.category ?? entry.bookSlug;
    const current = agg.get(category) ?? { total: 0, sum: 0 };
    current.total += 1;
    current.sum += entry.progress;
    agg.set(category, current);
  }
  return [...agg.entries()]
    .filter(([, a]) => a.total > 0)
    .map(([label, a]) => ({ label, progress: Math.round(a.sum / a.total) }))
    .sort((a, b) => b.progress - a.progress);
}

export type ContinueLearning = {
  bookSlug: string;
  title: string;
  level: string;
  progress: number;
  lastChapterNumber: number;
  href: string;
};

export function getContinueLearning(): ContinueLearning | null {
  const entries = Object.entries(getAllBookProgress());
  if (!entries.length) return null;
  const [bookSlug, record] = entries.sort((a, b) =>
    (b[1].updatedAt || "").localeCompare(a[1].updatedAt || "")
  )[0];
  const meta = books.find((b) => b.slug === bookSlug);
  return {
    bookSlug,
    title: meta?.title ?? bookSlug,
    level: meta?.level ?? "",
    progress: record.progress,
    lastChapterNumber: record.lastChapterNumber,
    href: `/tutorials/${bookSlug}/${record.lastChapterSlug}`
  };
}

export type PlanItem = {
  label: string;
  href: string;
  icon: "book" | "practice" | "playground" | "revision";
};

export function getTodayPlan(): PlanItem[] {
  const items: PlanItem[] = [];

  const cont = getContinueLearning();
  if (cont) {
    items.push({ label: `Continue "${cont.title}" (Chapter ${cont.lastChapterNumber})`, href: cont.href, icon: "book" });
  }

  if (getCompletedCount() > 0) {
    items.push({ label: "Keep the streak alive with a practice task", href: "/practice", icon: "practice" });
  }

  items.push({ label: "Apply knowledge in the playground", href: "/playground", icon: "playground" });
  items.push({ label: "Start a revision session", href: "/dashboard#revision", icon: "revision" });

  const due = getDueCount();
  if (due > 0) {
    items.push({
      label: `Review ${due} due flashcard${due === 1 ? "" : "s"}`,
      href: "/flashcards",
      icon: "revision"
    });
  }

  return items.slice(0, 4);
}

export type WeeklyPoint = { name: string; xp: number };

export function computeWeeklyActivity(): WeeklyPoint[] {
  const dates = new Set(getPracticeDates());
  const weeks: WeeklyPoint[] = [];
  const now = new Date();

  for (let w = 7; w >= 0; w--) {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - w * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    let count = 0;
    for (const key of dates) {
      const d = new Date(`${key}T00:00:00`);
      if (d >= start && d < end) count += 1;
    }
    weeks.push({ name: `${start.getMonth() + 1}/${start.getDate()}`, xp: count * 50 });
  }
  return weeks;
}

export { getRecentLearning };
export { getBookmarks };