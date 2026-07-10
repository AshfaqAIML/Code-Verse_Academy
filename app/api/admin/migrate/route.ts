import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Tutorial } from "@/lib/models/Tutorial";
import { Blog } from "@/lib/models/Blog";
import { Book } from "@/lib/models/Book";
import { requireAdmin } from "@/lib/admin-auth";
import { tutorialContent } from "@/lib/data";
import blogData from "@/data/blogs.json";
import fs from "node:fs";
import path from "node:path";

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  await connectDB();

  const results = { tutorials: 0, blogs: 0, books: 0 };

  const { type } = await request.json().catch(() => ({ type: "all" }));

  if (type === "all" || type === "tutorials") {
    for (const [slug, content] of Object.entries(tutorialContent)) {
      await Tutorial.findOneAndUpdate(
        { slug },
        {
          $set: {
            slug,
            title: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            overview: content.overview,
            sections: content.sections,
            example: content.example,
            practice: content.practice,
            quiz: content.quiz,
            outline: content.outline ?? [],
          },
        },
        { upsert: true }
      );
      results.tutorials++;
    }
  }

  if (type === "all" || type === "blogs") {
    for (const article of blogData.articles) {
      await Blog.findOneAndUpdate(
        { slug: article.slug },
        {
          $set: {
            slug: article.slug,
            title: article.title,
            category: article.category,
            excerpt: article.excerpt,
            wordCount: article.wordCount,
            readingTime: article.readingTime,
            blocks: article.blocks,
            published: true,
          },
        },
        { upsert: true }
      );
      results.blogs++;
    }
  }

  if (type === "all" || type === "books") {
    const booksDir = path.join(process.cwd(), "data", "books");
    const registryPath = path.join(booksDir, "registry.json");
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as { slug: string }[];
      for (const entry of registry) {
        const bookPath = path.join(booksDir, `${entry.slug}.json`);
        if (fs.existsSync(bookPath)) {
          const bookData = JSON.parse(fs.readFileSync(bookPath, "utf8"));
          await Book.findOneAndUpdate(
            { slug: bookData.slug },
            { $set: bookData },
            { upsert: true }
          );
          results.books++;
        }
      }
    }
  }

  return NextResponse.json({ success: true, migrated: results });
}
