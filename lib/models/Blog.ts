import mongoose, { Schema, Document } from "mongoose";

export type BlogBlockType = "paragraph" | "list" | "pre" | "heading";

export interface IBlogBlock {
  type: BlogBlockType;
  text: string;
  level?: number;
}

export interface IBlog extends Document {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  wordCount: number;
  readingTime: number;
  blocks: IBlogBlock[];
  published: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const BlogBlockSchema = new Schema<IBlogBlock>({
  type: { type: String, enum: ["paragraph", "list", "pre", "heading"], required: true },
  text: { type: String, required: true },
  level: Number,
}, { _id: false });

const BlogSchema = new Schema<IBlog>({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, default: "General" },
  excerpt: { type: String, default: "" },
  wordCount: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 },
  blocks: { type: [BlogBlockSchema], default: [] },
  published: { type: Boolean, default: true },
}, { timestamps: true });

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
