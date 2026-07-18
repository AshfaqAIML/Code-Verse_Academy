import mongoose, { Schema, Document } from "mongoose";

export interface IChapterEditBlock {
  type: string;
  text: string;
}

export interface IChapterEdit extends Document {
  bookSlug: string;
  chapterNumber: number;
  blocks: IChapterEditBlock[];
  updatedAt: Date;
  createdAt: Date;
}

const ChapterEditBlockSchema = new Schema<IChapterEditBlock>({
  type: String,
  text: String,
}, { _id: false });

const ChapterEditSchema = new Schema<IChapterEdit>({
  bookSlug: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
  blocks: [ChapterEditBlockSchema],
}, { timestamps: true });

ChapterEditSchema.index({ bookSlug: 1, chapterNumber: 1 }, { unique: true });

export const ChapterEdit = mongoose.models.ChapterEdit || mongoose.model<IChapterEdit>("ChapterEdit", ChapterEditSchema);
