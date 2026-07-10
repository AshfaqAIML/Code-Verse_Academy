"use client";

import { use } from "react";
import { BlogEditor } from "@/components/admin/blog-editor";

export default function EditBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <BlogEditor slug={slug} />;
}
