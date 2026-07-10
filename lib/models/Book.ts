import mongoose, { Schema, Document } from "mongoose";

export interface IBookBlock {
  type: string;
  text: string;
}

export interface IBookLesson {
  number: number;
  slug: string;
  title: string;
  blocks: IBookBlock[];
  readingTime?: number;
}

export interface IBookChapter {
  number: number;
  slug: string;
  title: string;
  blocks: IBookBlock[];
  code?: string;
  partNumber?: number;
  partTitle?: string;
  lessons?: IBookLesson[];
  readingTime?: number;
}

export interface IBookPart {
  number: number;
  slug: string;
  title: string;
  chapters: string[];
}

export interface IBook extends Document {
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  source?: string;
  chapters: IBookChapter[];
  parts?: IBookPart[];
  coverTheme?: string;
  updatedAt: Date;
  createdAt: Date;
}

const BookBlockSchema = new Schema<IBookBlock>({
  type: String,
  text: String,
}, { _id: false });

const BookLessonSchema = new Schema<IBookLesson>({
  number: Number,
  slug: String,
  title: String,
  blocks: [BookBlockSchema],
  readingTime: Number,
}, { _id: false });

const BookChapterSchema = new Schema<IBookChapter>({
  number: Number,
  slug: String,
  title: String,
  blocks: [BookBlockSchema],
  code: String,
  partNumber: Number,
  partTitle: String,
  lessons: [BookLessonSchema],
  readingTime: Number,
}, { _id: false });

const BookPartSchema = new Schema<IBookPart>({
  number: Number,
  slug: String,
  title: String,
  chapters: [String],
}, { _id: false });

const BookSchema = new Schema<IBook>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: String,
  description: String,
  source: String,
  chapters: [BookChapterSchema],
  parts: [BookPartSchema],
  coverTheme: String,
}, { timestamps: true });

export const Book = mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
