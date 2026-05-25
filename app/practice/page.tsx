import { PracticePlatform } from "@/components/practice/practice-platform";
import { courses } from "@/lib/data";
import { getLibraryBook, getLibraryBooks } from "@/lib/books";
import { createPracticeTracks, summarizeBookForPractice } from "@/lib/practice";

export default function PracticePage() {
  const uploadedBooks = getLibraryBooks().map((book) => summarizeBookForPractice(getLibraryBook(book.slug), book));
  const tracks = createPracticeTracks(courses, uploadedBooks);

  return <PracticePlatform tracks={tracks} />;
}
