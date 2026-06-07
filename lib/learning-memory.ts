export type RecentLearningItem = {
  title: string;
  href: string;
  kind: "course" | "tutorial" | "project" | "practice" | "book";
  updatedAt: string;
};

const recentKey = "codeverse-recent-learning";
const bookmarkKey = "codeverse-bookmarks";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readList<T>(key: string): T[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event(key === recentKey ? "codeverse-learning-memory" : "codeverse-bookmarks"));
  } catch {
    // Ignore storage failures.
  }
}

export function getRecentLearning() {
  return readList<RecentLearningItem>(recentKey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
}

export function recordRecentLearning(item: Omit<RecentLearningItem, "updatedAt">) {
  const list = getRecentLearning().filter((entry) => entry.href !== item.href);
  const next = [{ ...item, updatedAt: new Date().toISOString() }, ...list].slice(0, 8);
  writeList(recentKey, next);
  return next;
}

export function getBookmarks() {
  return readList<RecentLearningItem>(bookmarkKey);
}

export function toggleBookmark(item: Omit<RecentLearningItem, "updatedAt">) {
  const current = getBookmarks();
  const exists = current.some((entry) => entry.href === item.href);
  const next = exists
    ? current.filter((entry) => entry.href !== item.href)
    : [{ ...item, updatedAt: new Date().toISOString() }, ...current];

  writeList(bookmarkKey, next);
  return next;
}
