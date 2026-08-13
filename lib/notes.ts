export type Note = {
  id: string;
  title: string;
  href: string;
  kind: string;
  body: string;
  updatedAt: string;
};

const notesKey = "codeverse-notes";

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readNotes(): Note[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(notesKey);
    const parsed = raw ? (JSON.parse(raw) as Note[]) : [];
    return parsed.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function writeNotes(notes: Note[]) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(notesKey, JSON.stringify(notes));
    window.dispatchEvent(new Event("codeverse-notes"));
  } catch {
    // Notes should never break reading.
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

export function getNotes(): Note[] {
  return readNotes();
}

export function getNoteForHref(href: string): Note | null {
  return readNotes().find((note) => note.href === href) ?? null;
}

export function saveNote(input: { title: string; href: string; kind: string; body: string }): Note[] {
  const all = readNotes();
  const trimmedBody = input.body.trim();
  const existing = all.find((note) => note.href === input.href);

  const note: Note = {
    id: existing?.id ?? newId(),
    title: input.title,
    href: input.href,
    kind: input.kind,
    body: trimmedBody,
    updatedAt: new Date().toISOString()
  };

  const next = existing ? all.map((n) => (n.href === input.href ? note : n)) : [note, ...all];
  writeNotes(next);
  return next;
}

export function deleteNote(href: string): Note[] {
  const next = readNotes().filter((note) => note.href !== href);
  writeNotes(next);
  return next;
}