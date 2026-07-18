import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, Pencil } from "lucide-react";
import { getLibraryBook } from "@/lib/books";

type PageParams = Promise<{ slug: string }>;

export default async function AdminBookChaptersPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const book = getLibraryBook(slug);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/admin/books"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="size-4" /> Back to books
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-600">Book editor</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{book.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{book.chapters.length} chapters</p>
        </div>
        <a
          href={`/tutorials/${slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
        >
          <ExternalLink className="size-4" /> View book
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800">
            <tr className="text-slate-500">
              <th className="px-5 py-4 font-bold">#</th>
              <th className="px-5 py-4 font-bold">Title</th>
              <th className="px-5 py-4 font-bold">Blocks</th>
              <th className="px-5 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {book.chapters.map((ch) => (
              <tr key={ch.number} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40">
                <td className="px-5 py-4 text-slate-500">{ch.number}</td>
                <td className="px-5 py-4 font-semibold">{ch.title}</td>
                <td className="px-5 py-4 text-slate-500">{ch.blocks.length}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/books/${slug}/chapters/${ch.number}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                  >
                    <Pencil className="size-3.5" /> Edit blocks
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
