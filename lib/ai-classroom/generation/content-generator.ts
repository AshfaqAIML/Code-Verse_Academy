import type { QuizContent, QuizQuestion, Flashcard, GenerationResult, AICallFn } from "./types";

function parseJsonArray<T>(text: string): T[] | null {
  try {
    return JSON.parse(text) as T[];
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T[];
      } catch {}
    }
  }
  return null;
}

export async function generateQuizContent(
  title: string,
  keyPoints: string[],
  chapterContent: string,
  aiCall: AICallFn,
  count = 5,
): Promise<GenerationResult<QuizContent>> {
  const system = `You are a quiz generator. Create educational quiz questions based on the content provided.`;
  const user = [
    `Topic: ${title}`,
    `Key points: ${keyPoints.join(", ")}`,
    "",
    "Content:",
    chapterContent.slice(0, 3000),
    "",
    `Generate ${count} quiz questions. Mix of easy, medium, and hard.`,
    "Each question must have:",
    "- id: unique string",
    "- question: the question text",
    "- options: array of { value: \"A\"|\"B\"|\"C\"|\"D\", label: \"option text\" }",
    "- correctAnswer: array of correct option values (e.g. [\"A\"])",
    "- explanation: brief explanation of the answer",
    "- difficulty: \"easy\" | \"medium\" | \"hard\"",
    "",
    "Return as JSON array only. No markdown.",
  ].join("\n");

  try {
    const response = await aiCall(system, user);
    const questions = parseJsonArray<QuizQuestion>(response);
    if (!questions || questions.length === 0) {
      return { success: false, error: "Failed to parse quiz questions" };
    }
    return {
      success: true,
      data: {
        title,
        description: `Quiz on ${title}`,
        questions: questions.map((q, i) => ({
          ...q,
          id: q.id || `q-${i}`,
        })),
      },
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function generateFlashcards(
  title: string,
  keyPoints: string[],
  chapterContent: string,
  aiCall: AICallFn,
  count = 10,
): Promise<GenerationResult<Flashcard[]>> {
  const system = `You are a flashcard generator. Create study flashcards.`;
  const user = [
    `Topic: ${title}`,
    `Key points: ${keyPoints.join(", ")}`,
    "",
    "Content:",
    chapterContent.slice(0, 3000),
    "",
    `Generate ${count} flashcards. Each card:`,
    "- id: unique string",
    "- front: short question/term (1 sentence)",
    "- back: concise answer/definition (1-2 sentences)",
    "- topic: the topic name",
    "",
    "Return as JSON array only. No markdown.",
  ].join("\n");

  try {
    const response = await aiCall(system, user);
    const cards = parseJsonArray<Flashcard>(response);
    if (!cards || cards.length === 0) {
      return { success: false, error: "Failed to parse flashcards" };
    }
    return {
      success: true,
      data: cards.map((c, i) => ({ ...c, id: c.id || `fc-${i}` })),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
