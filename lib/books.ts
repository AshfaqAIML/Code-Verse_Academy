import fs from "node:fs";
import path from "node:path";

export type LibraryBookSummary = {
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  source: string;
  chapters: number;
  parts?: number;
  lessons?: number;
  estimatedMinutes?: number;
  coverTheme?: string;
};

export type LibraryBookBlock = {
  type: "heading" | "subheading" | "paragraph" | "list" | "callout" | "table" | "code";
  text: string;
};

export type LibraryBookLesson = {
  number: number;
  slug: string;
  title: string;
  blocks: LibraryBookBlock[];
  readingTime?: number;
};

export type LibraryBookChapter = {
  number: number;
  code?: string;
  slug: string;
  title: string;
  blocks: LibraryBookBlock[];
  partNumber?: number;
  partTitle?: string;
  lessons?: LibraryBookLesson[];
  readingTime?: number;
};

export type LibraryBookPart = {
  number: number;
  slug: string;
  title: string;
  chapters: string[];
};

export type LibraryBook = Omit<LibraryBookSummary, "chapters"> & {
  parts?: LibraryBookPart[];
  chapters: LibraryBookChapter[];
};

const booksDir = path.join(process.cwd(), "data", "books");
const preferredBookOrder = new Map([
  ["ai-from-scratch", 0],
  ["ai-from-scratch-vol1-foundations", 1],
  ["ai-from-scratch-vol2-deep-learning", 2],
  ["ai-from-scratch-vol3-language", 3],
  ["ai-from-scratch-vol4-llms", 4],
  ["ai-from-scratch-vol5-agents", 5],
  ["ai-from-scratch-vol6-production", 6],
  ["html-foundations", 7],
  ["css-design-systems", 8],
  ["javascript-mastery", 9],
  ["python-backend-foundation", 10],
  ["backend-development-and-databases", 10],
  ["advanced-backend-and-system-design", 11],
  ["backend-developer-interview-mastery", 12],
  ["backend-engineering-to-ai-systems", 13],
  ["python-backend-development", 14],
  ["python-engineering", 15],
  ["python-dsa", 16],
  ["fresher-to-job-ready-data-analyst", 17],
  ["english", 18],
  ["master-english-easily", 19],
  ["javascript-web-development-master-book", 20],
  ["ai-ml-handbook-volume-1", 21],
  ["ai-ml-handbook-volume-2", 22],
  ["aiml-engineer", 23],
  ["machine-learning-foundations", 24],
  ["from-neurons-to-gpt", 25]
]);

function sortBooksByLearningOrder<T extends { slug: string; title: string }>(books: T[]) {
  return [...books].sort((left, right) => {
    const leftRank = preferredBookOrder.get(left.slug);
    const rightRank = preferredBookOrder.get(right.slug);

    if (leftRank !== undefined || rightRank !== undefined) {
      return (leftRank ?? Number.MAX_SAFE_INTEGER) - (rightRank ?? Number.MAX_SAFE_INTEGER);
    }

    return left.title.localeCompare(right.title);
  });
}

export function getLibraryBooks(): LibraryBookSummary[] {
  const books = JSON.parse(fs.readFileSync(path.join(booksDir, "registry.json"), "utf8")) as LibraryBookSummary[];
  return sortBooksByLearningOrder(books);
}

export function getLibraryBook(slug: string): LibraryBook | null {
  const filePath = path.join(booksDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as LibraryBook;
}

export function getLibraryChapter(bookSlug: string, chapterSlug: string) {
  const book = getLibraryBook(bookSlug);
  if (!book) {
    return null;
  }
  const chapter = book.chapters.find((item) => item.slug === chapterSlug);
  if (!chapter) {
    return null;
  }
  const index = book.chapters.findIndex((item) => item.slug === chapterSlug);
  return {
    book,
    chapter,
    previous: index > 0 ? book.chapters[index - 1] : null,
    next: index < book.chapters.length - 1 ? book.chapters[index + 1] : null
  };
}

export function getLibraryLesson(bookSlug: string, chapterSlug: string, lessonSlug: string) {
  const chapterData = getLibraryChapter(bookSlug, chapterSlug);
  if (!chapterData) {
    return null;
  }

  const { book, chapter } = chapterData;
  const lessons = chapter.lessons ?? [];
  const lessonIndex = lessons.findIndex((item) => item.slug === lessonSlug);
  if (lessonIndex < 0) {
    return null;
  }

  return {
    book,
    chapter,
    lesson: lessons[lessonIndex],
    previousLesson: lessonIndex > 0 ? lessons[lessonIndex - 1] : null,
    nextLesson: lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null,
    totalLessons: lessons.length
  };
}
