import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TutorialReader } from "@/components/tutorials/tutorial-reader";
import { getLibraryBook, getLibraryBooks, getLibraryChapter } from "@/lib/books";

type PageParams = Promise<{ book: string; chapter: string }>;

export function generateStaticParams() {
  return getLibraryBooks().flatMap((book) => {
    const bookData = getLibraryBook(book.slug);
    return (bookData?.chapters ?? []).map((chapter) => ({
      book: book.slug,
      chapter: chapter.slug
    }));
  });
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const result = getLibraryChapter(bookSlug, chapterSlug);
  if (!result) return {};

  const { book, chapter } = result;
  const url = `https://code-verse-academy.vercel.app/tutorials/${book.slug}/${chapter.slug}`;
  return {
    title: `${chapter.title} | ${book.title} | CodeVerse Academy`,
    description: book.description,
    openGraph: {
      title: chapter.title,
      description: book.description,
      url,
      type: "article"
    },
    alternates: { canonical: url }
  };
}

export default async function TutorialBookChapterPage({ params }: { params: PageParams }) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const result = getLibraryChapter(bookSlug, chapterSlug);
  if (!result) notFound();

  const { book, chapter, previous, next } = result;

  const headings = chapter.blocks
    .map((block, index) => ({ ...block, index }))
    .filter((block) => block.type === "heading" || block.type === "subheading")
    .slice(0, 18);
  const revisionContent = chapter.blocks.map((block) => block.text).join("\n").slice(0, 24000);
  const previousChapterOptions = book.chapters
    .filter((item) => item.number < chapter.number)
    .map((item) => ({
      number: item.number,
      slug: item.slug,
      title: item.title,
      content: item.blocks.map((block) => block.text).join("\n").slice(0, 6000)
    }));

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            name: `${book.title} - ${chapter.title}`,
            description: book.description,
            author: {
              "@type": "Organization",
              name: "CodeVerse Academy"
            },
            url: `https://code-verse-academy.vercel.app/tutorials/${book.slug}/${chapter.slug}`
          })
        }}
      />
      <TutorialReader
        book={book}
        chapter={chapter}
        previous={previous}
        next={next}
        headings={headings}
        revisionContent={revisionContent}
        previousChapterOptions={previousChapterOptions}
      />
    </>
  );
}
