import type { LibraryBook, LibraryBookSummary } from "@/lib/books";

type CourseInput = {
  title: string;
  slug: string;
  category: string;
  level: string;
  lessons: number;
  progress: number;
  color: string;
  description: string;
  chapters: string[];
};

export type PracticeTaskType = "mcq" | "coding" | "project" | "interview" | "sql" | "dataset" | "reading";
export type PracticeDifficulty = "Easy" | "Medium" | "Hard";
export type PracticeStatus = "todo" | "in-progress" | "done";

export type PracticeTask = {
  id: string;
  title: string;
  type: PracticeTaskType;
  difficulty: PracticeDifficulty;
  xp: number;
  duration: string;
  status: PracticeStatus;
  prompt: string;
};

export type PracticeModule = {
  id: string;
  title: string;
  order: number;
  progress: number;
  locked?: boolean;
  tasks: PracticeTask[];
};

export type PracticeTrack = {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  source: "course" | "tutorial-book";
  accent: string;
  lessons: number;
  progress: number;
  modules: PracticeModule[];
};

export type PracticeBookInput = LibraryBookSummary & {
  chapterTitles: string[];
};

const accentPalette = [
  "from-cyan-400 to-blue-600",
  "from-emerald-300 to-teal-600",
  "from-amber-300 to-orange-500",
  "from-rose-300 to-fuchsia-600",
  "from-violet-300 to-indigo-600",
  "from-lime-300 to-emerald-600"
];

function taskPack(trackSlug: string, moduleTitle: string, order: number, category: string): PracticeTask[] {
  const normalizedCategory = category.toLowerCase();
  const hasSql = normalizedCategory.includes("data") || normalizedCategory.includes("sql") || moduleTitle.toLowerCase().includes("sql");
  const hasDataset = normalizedCategory.includes("data") || normalizedCategory.includes("ai") || normalizedCategory.includes("machine");

  return [
    {
      id: `${trackSlug}-${order}-mcq`,
      title: `${moduleTitle} concept check`,
      type: "mcq",
      difficulty: "Easy",
      xp: 80,
      duration: "10 min",
      status: order === 1 ? "in-progress" : "todo",
      prompt: `Answer focused MCQs that test the core ideas from ${moduleTitle}.`
    },
    {
      id: `${trackSlug}-${order}-${hasSql ? "sql" : "coding"}`,
      title: hasSql ? `${moduleTitle} SQL drill` : `${moduleTitle} coding lab`,
      type: hasSql ? "sql" : "coding",
      difficulty: order % 3 === 0 ? "Hard" : "Medium",
      xp: hasSql ? 140 : 160,
      duration: hasSql ? "20 min" : "30 min",
      status: "todo",
      prompt: hasSql
        ? `Write queries for a small learning dataset and explain why each clause is used.`
        : `Build a small working solution using the main idea from ${moduleTitle}.`
    },
    {
      id: `${trackSlug}-${order}-${hasDataset ? "dataset" : "project"}`,
      title: hasDataset ? `${moduleTitle} dataset task` : `${moduleTitle} mini project`,
      type: hasDataset ? "dataset" : "project",
      difficulty: "Medium",
      xp: 220,
      duration: "45 min",
      status: "todo",
      prompt: hasDataset
        ? `Explore a sample dataset, find two insights, and write a short conclusion.`
        : `Create a portfolio-style exercise that proves you can apply ${moduleTitle}.`
    },
    {
      id: `${trackSlug}-${order}-interview`,
      title: `${moduleTitle} interview round`,
      type: "interview",
      difficulty: order % 2 === 0 ? "Medium" : "Easy",
      xp: 120,
      duration: "15 min",
      status: "todo",
      prompt: `Practice explaining ${moduleTitle} clearly, with examples and common mistakes.`
    },
    {
      id: `${trackSlug}-${order}-reading`,
      title: `${moduleTitle} revision resource`,
      type: "reading",
      difficulty: "Easy",
      xp: 60,
      duration: "8 min",
      status: "todo",
      prompt: `Review the key notes, examples, mistakes and next-step resources for ${moduleTitle}.`
    }
  ];
}

function buildModules(slug: string, category: string, chapterTitles: string[], progressSeed: number): PracticeModule[] {
  const fallback = ["Foundation", "Hands-on practice", "Interview patterns", "Project checkpoint"];
  const topics = (chapterTitles.length ? chapterTitles : fallback).slice(0, 10);

  return topics.map((title, index) => {
    const order = index + 1;
    const progress = Math.max(0, Math.min(100, progressSeed - index * 8));

    return {
      id: `${slug}-module-${order}`,
      title,
      order,
      progress,
      locked: index > 5 && progressSeed < 45,
      tasks: taskPack(slug, title, order, category)
    };
  });
}

export function createPracticeTracks(courses: CourseInput[], books: PracticeBookInput[]): PracticeTrack[] {
  const courseTracks = courses.map((course, index) => ({
    id: course.slug,
    title: course.title,
    category: course.category,
    level: course.level,
    description: course.description,
    source: "course" as const,
    accent: course.color || accentPalette[index % accentPalette.length],
    lessons: course.lessons,
    progress: course.progress,
    modules: buildModules(course.slug, course.category, course.chapters, course.progress)
  }));

  const bookTracks = books.map((book, index) => {
    const progress = 18 + ((index * 9) % 48);

    return {
      id: book.slug,
      title: book.title,
      category: book.category,
      level: book.level,
      description: book.description,
      source: "tutorial-book" as const,
      accent: accentPalette[index % accentPalette.length],
      lessons: book.chapters,
      progress,
      modules: buildModules(book.slug, book.category, book.chapterTitles, progress)
    };
  });

  return [...courseTracks, ...bookTracks];
}

export function summarizeBookForPractice(book: LibraryBook | null, summary: LibraryBookSummary): PracticeBookInput {
  return {
    ...summary,
    chapterTitles: book?.chapters.slice(0, 12).map((chapter) => chapter.title) ?? []
  };
}
