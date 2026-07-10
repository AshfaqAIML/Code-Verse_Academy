import mongoose, { Schema, Document } from "mongoose";

export interface ITutorialSection {
  heading: string;
  body: string;
}

export interface ITutorialQuiz {
  question: string;
  answer: string;
}

export interface ITutorialOutline {
  part: string;
  chapters: string[];
}

export interface ITutorial extends Document {
  slug: string;
  title: string;
  category?: string;
  level?: string;
  lessons?: number;
  description?: string;
  chapters?: string[];
  certificate?: boolean;
  bookSlug?: string;
  overview: string;
  sections: ITutorialSection[];
  example: string;
  practice: string[];
  quiz: ITutorialQuiz[];
  outline?: ITutorialOutline[];
  color?: string;
  updatedAt: Date;
  createdAt: Date;
}

const TutorialSectionSchema = new Schema<ITutorialSection>({
  heading: { type: String, required: true },
  body: { type: String, required: true },
}, { _id: false });

const TutorialQuizSchema = new Schema<ITutorialQuiz>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
}, { _id: false });

const TutorialOutlineSchema = new Schema<ITutorialOutline>({
  part: { type: String, required: true },
  chapters: [{ type: String }],
}, { _id: false });

const TutorialSchema = new Schema<ITutorial>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: String,
  level: String,
  lessons: Number,
  description: String,
  chapters: [String],
  certificate: Boolean,
  bookSlug: String,
  overview: { type: String, default: "" },
  sections: { type: [TutorialSectionSchema], default: [] },
  example: { type: String, default: "" },
  practice: { type: [String], default: [] },
  quiz: { type: [TutorialQuizSchema], default: [] },
  outline: [TutorialOutlineSchema],
  color: String,
}, { timestamps: true });

export const Tutorial = mongoose.models.Tutorial || mongoose.model<ITutorial>("Tutorial", TutorialSchema);
