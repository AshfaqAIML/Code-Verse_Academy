import { Model } from "mongoose";
import { connectDB } from "./db";
import { Tutorial } from "./models/Tutorial";
import { Blog } from "./models/Blog";
import { Book } from "./models/Book";

const models: Record<string, Model<any>> = {
  tutorials: Tutorial,
  blogs: Blog,
  books: Book,
};

export async function readCollection<T>(name: string): Promise<T[]> {
  await connectDB();
  const model = models[name];
  if (!model) return [];
  return model.find({}).lean() as unknown as T[];
}

export async function writeCollection<T>(name: string, data: T[]) {
  await connectDB();
  const model = models[name];
  if (!model) throw new Error(`Unknown collection: ${name}`);
  await model.deleteMany({});
  if (data.length > 0) {
    await model.insertMany(data);
  }
}

export async function findOne<T extends { slug: string }>(
  name: string,
  slug: string
): Promise<T | null> {
  await connectDB();
  const model = models[name];
  if (!model) return null;
  return model.findOne({ slug }).lean() as unknown as T | null;
}

export async function upsertOne<T extends { slug: string; [key: string]: unknown }>(
  name: string,
  item: T
): Promise<T> {
  await connectDB();
  const model = models[name];
  if (!model) throw new Error(`Unknown collection: ${name}`);
  const result = await model
    .findOneAndUpdate({ slug: item.slug }, { $set: item }, { upsert: true, new: true })
    .lean();
  return result as unknown as T;
}

export async function deleteOne(name: string, slug: string): Promise<boolean> {
  await connectDB();
  const model = models[name];
  if (!model) return false;
  const { deletedCount } = await model.deleteOne({ slug });
  return (deletedCount ?? 0) > 0;
}
