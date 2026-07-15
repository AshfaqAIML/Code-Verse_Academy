import fs from "node:fs";
import path from "node:path";

const STORE_DIR = path.join(process.cwd(), "data", "admin");

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function readCollection<T>(name: string): T[] {
  ensureDir();
  const fp = path.join(STORE_DIR, `${name}.json`);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

export function writeCollection<T>(name: string, data: T[]) {
  ensureDir();
  const fp = path.join(STORE_DIR, `${name}.json`);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf8");
}

export function findOne<T extends { slug: string }>(name: string, slug: string): T | null {
  const items = readCollection<T>(name);
  return items.find((i) => i.slug === slug) ?? null;
}

export function upsertOne<T extends { slug: string; [key: string]: unknown }>(name: string, item: T): T {
  const items = readCollection<T>(name);
  const idx = items.findIndex((i) => i.slug === item.slug);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  writeCollection(name, items);
  return item;
}

export function deleteOne(name: string, slug: string): boolean {
  const items = readCollection(name);
  const idx = items.findIndex((i) => (i as { slug: string }).slug === slug);
  if (idx < 0) return false;
  items.splice(idx, 1);
  writeCollection(name, items);
  return true;
}
