export type QuizQuestion = {
  id: string;
  question: string;
  options: { value: string; label: string }[];
  correctAnswer: string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

export type QuizContent = {
  title: string;
  description: string;
  questions: QuizQuestion[];
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  topic?: string;
};

export type OutlineItem = {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "flashcard" | "summary";
  keyPoints: string[];
};

export type GenerationRequest = {
  chapterContent: string;
  chapterTitle: string;
  type: "quiz" | "flashcard" | "summary";
  count?: number;
};

export type GenerationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type AICallFn = (system: string, user: string) => Promise<string>;
