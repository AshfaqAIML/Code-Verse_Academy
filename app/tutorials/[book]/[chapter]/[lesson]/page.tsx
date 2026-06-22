import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AIVolumeReader } from "@/components/tutorials/ai-volume-reader";
import { getLibraryLesson } from "@/lib/books";

export const dynamic = "force-dynamic";

type PageParams = Promise<{ book: string; chapter: string; lesson: string }>;

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterSlug, lesson: lessonSlug } = await params;
  const result = getLibraryLesson(bookSlug, chapterSlug, lessonSlug);
  if (!result) return {};

  const { book, chapter, lesson } = result;
  const url = `https://code-verse-academy.vercel.app/tutorials/${book.slug}/${chapter.slug}/${lesson.slug}`;
  return {
    title: `${lesson.title} | ${chapter.title} | ${book.title} | CodeVerse Academy`,
    description: book.description,
    openGraph: {
      title: lesson.title,
      description: book.description,
      url,
      type: "article"
    },
    alternates: { canonical: url }
  };
}

export default async function TutorialLessonPage({ params }: { params: PageParams }) {
  const { book: bookSlug, chapter: chapterSlug, lesson: lessonSlug } = await params;
  const result = getLibraryLesson(bookSlug, chapterSlug, lessonSlug);
  if (!result) notFound();

  const { book, chapter, lesson, previousLesson, nextLesson } = result;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: `${lesson.title} | ${chapter.title} | ${book.title}`,
            description: book.description,
            url: `https://code-verse-academy.vercel.app/tutorials/${book.slug}/${chapter.slug}/${lesson.slug}`
          })
        }}
      />
      <AIVolumeReader book={book} chapter={chapter} lesson={lesson} previousLesson={previousLesson} nextLesson={nextLesson} />
    </>
  );
}
