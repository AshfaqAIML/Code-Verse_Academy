import { generateText } from "ai";
import { createLanguageModel, getProviderConfig } from "./providers";
import type { ProviderId } from "./providers";
import type { QuizQuestion } from "./generation/types";

export type LessonSceneType = "slide" | "quiz" | "discussion";

export type LessonScene = {
  id: string;
  title: string;
  type: LessonSceneType;
  content: string;
  quizQuestions?: QuizQuestion[];
  discussionPrompt?: string;
};

export type LessonPlan = {
  title: string;
  topic: string;
  scenes: LessonScene[];
};

type RawScene = {
  title: string;
  type: LessonSceneType;
  content: string;
  quiz_questions?: Omit<QuizQuestion, "id">[];
  discussion_prompt?: string;
};

function parseLessonJson(text: string): LessonPlan | null {
  const json = text.replace(/```(?:json)?\n?/g, "").trim();
  const start = json.indexOf("{");
  const end = json.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    const parsed = JSON.parse(json.slice(start, end + 1));
    const rawScenes: RawScene[] = parsed.scenes ?? [];
    const scenes: LessonScene[] = rawScenes.map((s: RawScene, i: number) => ({
      id: `scene-${i}`,
      title: s.title || `Section ${i + 1}`,
      type: s.type || "slide",
      content: s.content || "",
      quizQuestions: (s.quiz_questions ?? []).map((q, qi) => ({
        ...q,
        id: `scene-q-${i}-${qi}`,
      })),
      discussionPrompt: s.discussion_prompt,
    }));

    return {
      title: parsed.title || `Lesson: ${parsed.topic || "Untitled"}`,
      topic: parsed.topic || "",
      scenes,
    };
  } catch {
    return null;
  }
}

export async function generateLesson(topic: string, provider?: ProviderId): Promise<LessonPlan> {
  const config = getProviderConfig(provider);
  if (!config.apiKey) {
    throw new Error("No API key configured. Set OPENAI_API_KEY or another provider key.");
  }

  const model = createLanguageModel(config);

  const systemPrompt = `You are an expert curriculum designer. Create a structured lesson plan for the given topic.

Return a JSON object with this structure:
{
  "title": "Lesson title",
  "topic": "the topic",
  "scenes": [
    {
      "title": "Scene title",
      "type": "slide" | "quiz" | "discussion",
      "content": "Detailed markdown content for slide scenes",
      "quiz_questions": [ // only for type "quiz"
        {
          "question": "Question text",
          "options": [{ "value": "A", "label": "option text" }, { "value": "B", "label": "text" }, { "value": "C", "label": "text" }, { "value": "D", "label": "text" }],
          "correctAnswer": ["A"],
          "explanation": "Why this is correct",
          "difficulty": "easy" | "medium" | "hard"
        }
      ],
      "discussion_prompt": "Prompt for AI classmates to discuss" // only for type "discussion"
    }
  ]
}

Guidelines:
- Create 4-7 scenes total
- First scene should always be a "slide" introducing the topic
- Mix scene types: mostly slides with 1 quiz and 1 discussion
- Slide content should be detailed markdown with headings, bullet points, code examples, and explanations
- Quiz scenes should have 3-5 questions mixing easy/medium/hard
- Discussion scenes should have a prompt that engages multiple perspectives
- Use clear, educational language suitable for self-study
- Return ONLY valid JSON, no other text`;

  const result = await generateText({
    model,
    system: systemPrompt,
    prompt: `Create a structured lesson plan for: ${topic}`,
    temperature: 0.7,
    maxOutputTokens: 8192,
  });

  const text = result.text || "";
  const lesson = parseLessonJson(text);
  if (!lesson) {
    throw new Error("Failed to parse lesson plan from AI response");
  }

  return lesson;
}
