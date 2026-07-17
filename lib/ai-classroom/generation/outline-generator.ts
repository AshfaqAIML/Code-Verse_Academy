import type { OutlineItem, GenerationResult, AICallFn } from "./types";

export async function generateOutlines(
  chapterContent: string,
  chapterTitle: string,
  aiCall: AICallFn,
): Promise<GenerationResult<OutlineItem[]>> {
  const system = `You are a curriculum designer. Analyze the chapter content and create structured learning items.`;
  const user = [
    `Chapter: "${chapterTitle}"`,
    "",
    "Content:",
    chapterContent.slice(0, 3000),
    "",
    "Generate a list of learning items (quiz sets, flashcard sets, summaries) that cover the key concepts.",
    "Each item should have:",
    "- id: unique string",
    "- title: short name",
    "- description: what this covers",
    "- type: 'quiz' | 'flashcard' | 'summary'",
    "- keyPoints: array of 2-4 key points",
    "",
    "Return as JSON array: [{ id, title, description, type, keyPoints }]",
    "Include 1-2 quiz items, 1-2 flashcard items, and 1 summary item.",
  ].join("\n");

  try {
    const response = await aiCall(system, user);
    const parsed = JSON.parse(response);
    if (!Array.isArray(parsed)) {
      return { success: false, error: "Invalid response format" };
    }
    const items: OutlineItem[] = parsed.map((item: OutlineItem, i: number) => ({
      id: item.id || `outline-${i}`,
      title: item.title,
      description: item.description,
      type: item.type,
      keyPoints: item.keyPoints || [],
    }));
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
