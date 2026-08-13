export type Flashcard = {
  id: string;
  title: string;
  href: string;
  kind: string;
  front: string;
  back: string;
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  dueAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
};

const storageKey = "codeverse-flashcards";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readCards(): Flashcard[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Flashcard[]) : [];
  } catch {
    return [];
  }
}

function writeCards(cards: Flashcard[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey, JSON.stringify(cards));
    window.dispatchEvent(new Event("codeverse-flashcards"));
  } catch {
    // Flashcards should never break reading.
  }
}

function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export type NewFlashcardInput = {
  title: string;
  href: string;
  kind: string;
  front: string;
  back: string;
};

export function getFlashcards(): Flashcard[] {
  return readCards();
}

export function getDueFlashcards(): Flashcard[] {
  const now = Date.now();
  return readCards()
    .filter((card) => new Date(card.dueAt).getTime() <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export function getDueCount(): number {
  return getDueFlashcards().length;
}

export function addFlashcard(input: NewFlashcardInput): Flashcard[] {
  const existing = readCards().find(
    (card) => card.href === input.href && card.front.trim() === input.front.trim()
  );
  if (existing) return readCards();

  const card: Flashcard = {
    id: newId(),
    title: input.title,
    href: input.href,
    kind: input.kind,
    front: input.front.trim(),
    back: input.back.trim(),
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: new Date().toISOString(),
    lastReviewedAt: null,
    createdAt: new Date().toISOString()
  };

  const next = [...readCards(), card];
  writeCards(next);
  return next;
}

export function deleteFlashcard(id: string): Flashcard[] {
  const next = readCards().filter((card) => card.id !== id);
  writeCards(next);
  return next;
}

export function resetFlashcard(id: string): Flashcard[] {
  const next = readCards().map((card) =>
    card.id === id
      ? {
          ...card,
          ease: 2.5,
          intervalDays: 0,
          reps: 0,
          lapses: 0,
          dueAt: new Date().toISOString(),
          lastReviewedAt: null
        }
      : card
  );
  writeCards(next);
  return next;
}

export type GradeQuality = 1 | 3 | 4 | 5;

function gradeInterval(ease: number, reps: number, intervalDays: number): number {
  if (reps === 0) return 1;
  if (reps === 1) return 6;
  return Math.max(1, Math.round(intervalDays * ease));
}

export function gradeFlashcard(id: string, quality: GradeQuality): Flashcard[] {
  const next = readCards().map((card) => {
    if (card.id !== id) return card;

    if (quality < 3) {
      return {
        ...card,
        reps: 0,
        intervalDays: 0,
        lapses: card.lapses + 1,
        ease: Math.max(1.3, card.ease - 0.2),
        dueAt: new Date().toISOString(),
        lastReviewedAt: new Date().toISOString()
      };
    }

    const nextEase = Math.max(1.3, card.ease + (0.1 - (5 - quality) * 0.08));
    const nextReps = card.reps + 1;
    return {
      ...card,
      reps: nextReps,
      intervalDays: gradeInterval(nextEase, nextReps, card.intervalDays),
      ease: nextEase,
      dueAt: daysFromNow(gradeInterval(nextEase, nextReps, card.intervalDays)),
      lastReviewedAt: new Date().toISOString()
    };
  });
  writeCards(next);
  return next;
}

export function formatDue(card: Flashcard): string {
  const diff = new Date(card.dueAt).getTime() - Date.now();
  if (diff <= 0) return "Due now";
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days}d`;
}

export function cardState(card: Flashcard): "new" | "learning" | "review" | "mature" {
  if (card.reps === 0) return "new";
  if (card.reps === 1) return "learning";
  if (card.intervalDays >= 21) return "mature";
  return "review";
}