import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const booksDir = path.join(root, "data", "books");
const registryPath = path.join(booksDir, "registry.json");
const searchIndexPath = path.join(booksDir, "search-index.json");
const errors = [];

function error(message) {
  errors.push(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (cause) {
    error(`${path.relative(root, file)}: invalid JSON (${cause instanceof Error ? cause.message : String(cause)})`);
    return null;
  }
}

const registry = readJson(registryPath);
const searchIndex = readJson(searchIndexPath);

if (!Array.isArray(registry)) {
  error("data/books/registry.json must contain an array.");
}

const registrySlugs = new Set();
const routes = new Set();

function validateBook(item, source = "registry") {
  if (!item?.slug || !item?.title || !item?.description) {
    error(`${source} entry is missing slug, title, or description: ${JSON.stringify(item)}`);
    return;
  }

  const file = path.join(booksDir, `${item.slug}.json`);
  if (!fs.existsSync(file)) {
    error(`registry book has no content file: data/books/${item.slug}.json`);
    return;
  }

  const book = readJson(file);
  if (!book || book.slug !== item.slug || !Array.isArray(book.chapters) || book.chapters.length === 0) {
    error(`invalid book content: data/books/${item.slug}.json`);
    return;
  }

  routes.add(`/tutorials/${item.slug}`);
  const chapterSlugs = new Set();
  for (const chapter of book.chapters) {
    if (!chapter?.slug || !chapter?.title || !Array.isArray(chapter.blocks)) {
      error(`${item.slug}: chapter is missing slug, title, or blocks.`);
      continue;
    }
    if (chapterSlugs.has(chapter.slug)) error(`${item.slug}: duplicate chapter slug ${chapter.slug}`);
    chapterSlugs.add(chapter.slug);
    const chapterRoute = `/tutorials/${item.slug}/${chapter.slug}`;
    routes.add(chapterRoute);

    const lessonSlugs = new Set();
    for (const lesson of chapter.lessons ?? []) {
      if (!lesson?.slug || !lesson?.title || !Array.isArray(lesson.blocks)) {
        error(`${item.slug}/${chapter.slug}: lesson is missing slug, title, or blocks.`);
        continue;
      }
      if (lessonSlugs.has(lesson.slug)) error(`${item.slug}/${chapter.slug}: duplicate lesson slug ${lesson.slug}`);
      lessonSlugs.add(lesson.slug);
      routes.add(`${chapterRoute}/${lesson.slug}`);
    }
  }

  for (const part of book.parts ?? []) {
    if (!part?.title || !Array.isArray(part.chapters)) {
      error(`${item.slug}: invalid part definition.`);
      continue;
    }
    for (const chapterSlug of part.chapters) {
      if (!chapterSlugs.has(chapterSlug)) error(`${item.slug}: part references missing chapter ${chapterSlug}`);
    }
  }
}

for (const item of Array.isArray(registry) ? registry : []) {
  if (registrySlugs.has(item?.slug)) error(`duplicate book slug in registry: ${item.slug}`);
  registrySlugs.add(item?.slug);
  validateBook(item);
}

for (const filename of fs.readdirSync(booksDir).filter((name) => name.endsWith(".json") && !["registry.json", "search-index.json"].includes(name))) {
  const book = readJson(path.join(booksDir, filename));
  if (book?.slug && !registrySlugs.has(book.slug)) {
    validateBook(book, `unregistered book ${filename}`);
  }
}

if (!Array.isArray(searchIndex)) {
  error("data/books/search-index.json must contain an array.");
} else {
  for (const item of searchIndex) {
    if (!item?.label || !item?.href || !item?.group) {
      error(`search entry is incomplete: ${JSON.stringify(item)}`);
      continue;
    }
    if (item.href.startsWith("/tutorials/") && !routes.has(item.href)) {
      error(`search entry points to a missing tutorial route: ${item.href}`);
    }
  }
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  for (const item of errors) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log(`Content validation passed: ${registrySlugs.size} books and ${routes.size} tutorial routes checked.`);
}
