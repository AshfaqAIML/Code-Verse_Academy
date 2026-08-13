import { PracticeHistory } from "@/components/practice/practice-history";
import { courses } from "@/lib/data";
import { getLibraryBook, getLibraryBooks } from "@/lib/books";
import { createPracticeTracks, summarizeBookForPractice } from "@/lib/practice";

export default function PracticeHistoryPage() {
  const uploadedBooks = getLibraryBooks().map((book) => summarizeBookForPractice(getLibraryBook(book.slug), book));
  const tracks = createPracticeTracks(courses, uploadedBooks);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 text-sm font-black uppercase tracking-wide text-brand-600 dark:text-cyan-300">
          Practice history
        </p>
        <h1 className="text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">
          Your completed practice
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
          Tasks completed, XP earned and your daily practice activity — built only from your real progress.
        </p>
      </header>
      <PracticeHistory tracks={tracks} />
    </div>
  );
}
