import registry from "@/data/books/registry.json";
import { getAllBookProgress } from "@/lib/book-progress";
import { getDashboardStats } from "@/lib/stats";
import { getFlashcards, getDueCount } from "@/lib/flashcards";
import type { BookProgressRecord } from "@/lib/book-progress";

type RegistryEntry = { slug: string; title: string; category: string; chapters: number };

const books = registry as RegistryEntry[];

export type TrackBook = {
  slug: string;
  title: string;
  chapters: number;
  progress: number;
  status: "done" | "in-progress" | "todo";
};

export type CareerTrack = {
  name: string;
  categories: string[];
  progress: number;
  books: TrackBook[];
};

export type CareerSkill = {
  category: string;
  proficiency: number;
  started: number;
  completed: number;
  total: number;
  focusHref: string;
};

export type Rank = { title: string; min: number; next: number | null };

export type Milestone = { label: string; done: boolean };

export type CareerData = {
  xp: number;
  masteredLessons: number;
  practiceCompleted: number;
  rank: Rank;
  rankProgress: number;
  skills: CareerSkill[];
  tracks: CareerTrack[];
  milestones: Milestone[];
  hasAnyProgress: boolean;
};

const TRACK_DEFS: { name: string; categories: string[] }[] = [
  { name: "Programming Foundation", categories: ["Programming", "DSA", "Interview"] },
  { name: "Web Development", categories: ["Web"] },
  { name: "Backend & Data", categories: ["Backend", "Data"] },
  { name: "AI & Machine Learning", categories: ["AI/ML"] },
  { name: "Communication & Growth", categories: ["Communication"] }
];

const RANKS: { title: string; min: number }[] = [
  { title: "Novice", min: 0 },
  { title: "Apprentice", min: 200 },
  { title: "Practitioner", min: 600 },
  { title: "Builder", min: 1500 },
  { title: "Architect", min: 3000 }
];

function rankForXp(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) if (xp >= r.min) current = r;
  const next = RANKS.find((r) => r.min > xp) ?? null;
  return { title: current.title, min: current.min, next: next ? next.min : null };
}

export function computeCareer(): CareerData {
  const progress = getAllBookProgress();
  const stats = getDashboardStats();
  const flashcards = getFlashcards();

  let masteredLessons = 0;
  const perCategory = new Map<string, { total: number; started: number; completed: number; sum: number }>();

  for (const entry of books) {
    const rec: BookProgressRecord | undefined = progress[entry.slug];
    const pct = rec?.progress ?? 0;
    masteredLessons += Math.round((pct / 100) * entry.chapters);

    const agg = perCategory.get(entry.category) ?? { total: 0, started: 0, completed: 0, sum: 0 };
    agg.total += 1;
    if (pct > 0) agg.started += 1;
    if (pct >= 100) agg.completed += 1;
    agg.sum += pct;
    perCategory.set(entry.category, agg);
  }

  const bookXp = masteredLessons * 50;
  const practiceXp = stats.completed * 50;
  const xp = bookXp + practiceXp;

  const skills: CareerSkill[] = [...perCategory.entries()]
    .map(([category, a]) => {
      const focusBook = books.find((b) => {
        if (b.category !== category) return false;
        const pct = progress[b.slug]?.progress ?? 0;
        return pct > 0 && pct < 100;
      });
      let focusHref = focusBook ? getCareerTrackUrl(focusBook.slug) : "";
      if (!focusHref) {
        const todoBook = books.find((b) => b.category === category && !progress[b.slug]);
        focusHref = todoBook ? getCareerTrackUrl(todoBook.slug) : "";
      }
      return {
        category,
        proficiency: a.started > 0 ? Math.round(a.sum / a.started) : 0,
        started: a.started,
        completed: a.completed,
        total: a.total,
        focusHref
      };
    })
    .sort((a, b) => b.proficiency - a.proficiency);

  const tracks: CareerTrack[] = TRACK_DEFS.map((def) => {
    const trackBooks = books
      .filter((b) => def.categories.includes(b.category))
      .map((b) => {
        const rec = progress[b.slug];
        const pct = rec?.progress ?? 0;
        const status: TrackBook["status"] = pct >= 100 ? "done" : pct > 0 ? "in-progress" : "todo";
        return { slug: b.slug, title: b.title, chapters: b.chapters, progress: pct, status } satisfies TrackBook;
      });
    const done = trackBooks.filter((b) => b.status === "done").length;
    const startedProgress = trackBooks.reduce((acc, b) => acc + b.progress, 0);
    const trackProgress = trackBooks.length
      ? Math.round(startedProgress / trackBooks.length)
      : 0;
    return { name: def.name, categories: def.categories, progress: trackProgress, books: trackBooks };
  });

  const rank = rankForXp(xp);
  let rankProgress = 0;
  if (rank.next !== null) {
    rankProgress = Math.min(100, Math.round(((xp - rank.min) / (rank.next - rank.min)) * 100));
  } else {
    rankProgress = 100;
  }

  const milestones: Milestone[] = [
    { label: "Start your first lesson", done: masteredLessons > 0 },
    { label: "Complete 5 lessons", done: masteredLessons >= 5 },
    { label: "Master a full book", done: Object.values(progress).some((r) => r.progress >= 100) },
    { label: "Complete a practice task", done: stats.completed >= 1 },
    { label: "Practice 3 days in a row", done: stats.longestStreak >= 3 },
    { label: "Review a flashcard", done: getDueCount() > 0 || flashcards.length > 0 }
  ];

  return {
    xp,
    masteredLessons,
    practiceCompleted: stats.completed,
    rank,
    rankProgress,
    skills,
    tracks,
    milestones,
    hasAnyProgress: masteredLessons > 0 || stats.completed > 0
  };
}

export function getCareerTrackUrl(slug: string) {
  return `/tutorials/${slug}`;
}