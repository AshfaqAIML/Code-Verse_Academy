import type { Metadata } from "next";
import { ClassmatesPage } from "@/components/ai-classroom/classmates-page";

export const metadata: Metadata = {
  title: "AI Classmates | CodeVerse Academy",
  description: "Learn with AI peers at different skill levels — Beginner Alex, Intermediate Jordan, and Advanced Sam.",
};

export default function AIClassmatesPage() {
  return <ClassmatesPage />;
}
