"use client";

import { use } from "react";
import { TutorialEditor } from "@/components/admin/tutorial-editor";

export default function EditTutorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <TutorialEditor slug={slug} />;
}
