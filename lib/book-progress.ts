export type BookProgressRecord = {
  bookSlug: string;
  lastChapterSlug: string;
  lastChapterNumber: number;
  totalChapters: number;
  progress: number;
  updatedAt: string;
};

const storageKey = "codeverse-book-progress";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readAllProgress(): Record<string, BookProgressRecord> {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, BookProgressRecord>) : {};
  } catch {
    return {};
  }
}

function writeAllProgress(progress: Record<string, BookProgressRecord>) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(storageKey, JSON.stringify(progress));
  } catch {
    // Progress should never break reading.
  }
}

export function getBookProgress(bookSlug: string): BookProgressRecord | null {
  const all = readAllProgress();
  return all[bookSlug] ?? null;
}

export function getResumeChapterSlug(bookSlug: string, fallback = "chapter-01") {
  return getBookProgress(bookSlug)?.lastChapterSlug || fallback;
}

export function recordBookProgress(input: {
  bookSlug: string;
  chapterSlug: string;
  chapterNumber: number;
  totalChapters: number;
}) {
  const progress = Math.max(1, Math.min(100, Math.round((input.chapterNumber / Math.max(1, input.totalChapters)) * 100)));
  const all = readAllProgress();

  all[input.bookSlug] = {
    bookSlug: input.bookSlug,
    lastChapterSlug: input.chapterSlug,
    lastChapterNumber: input.chapterNumber,
    totalChapters: input.totalChapters,
    progress,
    updatedAt: new Date().toISOString()
  };

  writeAllProgress(all);
  return all[input.bookSlug];
}

