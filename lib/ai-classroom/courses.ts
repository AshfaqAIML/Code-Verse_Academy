import { courses } from "@/lib/data";
import { getLibraryBook } from "@/lib/books";
import type { LibraryBook, LibraryBookChapter } from "@/lib/books";

export type AICourse = {
  title: string;
  slug: string;
  category: string;
  level: string;
  color: string;
  description: string;
  book: LibraryBook | null;
};

const coursesWithBooks = courses.filter(
  (c): c is typeof c & { bookSlug: string } => {
    const maybe = c as Record<string, unknown>;
    return typeof maybe.bookSlug === "string";
  }
);

const slugToBookMap = new Map<string, string>();
for (const c of coursesWithBooks) {
  slugToBookMap.set(c.slug, c.bookSlug);
}

slugToBookMap.set("aiml-engineer", "aiml-engineer");

export function getAICourses(): AICourse[] {
  const results: AICourse[] = [];
  for (const c of courses) {
    const bookSlug = slugToBookMap.get(c.slug);
    if (!bookSlug) continue;
    const book = getLibraryBook(bookSlug);
    if (!book) continue;
    results.push({
      title: c.title,
      slug: c.slug,
      category: c.category,
      level: c.level,
      color: c.color,
      description: c.description,
      book,
    });
  }
  return results;
}

export function getAICourse(slug: string): AICourse | null {
  const course = courses.find((c) => c.slug === slug);
  if (!course) return null;
  const bookSlug = slugToBookMap.get(slug);
  if (!bookSlug) return null;
  const book = getLibraryBook(bookSlug);
  if (!book) return null;
  return {
    title: course.title,
    slug: course.slug,
    category: course.category,
    level: course.level,
    color: course.color,
    description: course.description,
    book,
  };
}
