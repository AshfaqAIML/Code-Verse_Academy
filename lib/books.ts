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
  ["html-foundations", 0],
  ["css-design-systems", 1],
  ["javascript-mastery", 2],
  ["python-backend-foundation", 3],
  ["backend-development-and-databases", 4],
  ["advanced-backend-and-system-design", 5],
  ["backend-developer-interview-mastery", 6],
  ["backend-engineering-to-ai-systems", 7],
  ["python-backend-development", 8],
  ["python-engineering", 9],
  ["python-dsa", 10],
  ["fresher-to-job-ready-data-analyst", 11],
  ["english", 12],
  ["master-english-easily", 13],
  ["javascript-web-development-master-book", 14],
  ["ai-ml-handbook-volume-1", 15],
  ["ai-ml-handbook-volume-2", 16],
  ["aiml-engineer", 17],
  ["machine-learning-foundations", 18]
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
