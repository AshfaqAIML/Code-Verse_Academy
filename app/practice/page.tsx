import { Suspense } from "react";
import { PracticePlatform } from "@/components/practice/practice-platform";
import { courses } from "@/lib/data";
import { getLibraryBook, getLibraryBooks } from "@/lib/books";
import { createPracticeTracks, summarizeBookForPractice } from "@/lib/practice";

export default function PracticePage() {
  const uploadedBooks = getLibraryBooks().map((book) => summarizeBookForPractice(getLibraryBook(book.slug), book));
  const tracks = createPracticeTracks(courses, uploadedBooks);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="font-semibold text-slate-500">Loading practice tracks…</p>
        </div>
      }
    >
      <PracticePlatform tracks={tracks} />
    </Suspense>
  );
}
