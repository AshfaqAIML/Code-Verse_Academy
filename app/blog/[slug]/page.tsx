import { notFound } from "next/navigation";
import { BlogReader } from "@/components/blog/blog-reader";
import { getBlogArticle, getBlogArticles } from "@/lib/blogs";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | CodeVerse Blog`,
    description: article.excerpt
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();

  const articles = getBlogArticles();
  const index = articles.findIndex((item) => item.slug === slug);

  return <BlogReader article={article} previous={index > 0 ? articles[index - 1] : null} next={index < articles.length - 1 ? articles[index + 1] : null} />;
}
