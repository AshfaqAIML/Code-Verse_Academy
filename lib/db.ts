import mongoose from "mongoose";

declare global {
  var __mongoose: typeof mongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codeverse";

export async function connectDB() {
  if (globalThis.__mongoose) return globalThis.__mongoose;
  const conn = await mongoose.connect(MONGODB_URI);
  globalThis.__mongoose = conn;
  return conn;
}
