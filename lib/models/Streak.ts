import mongoose, { Schema, Document } from "mongoose";

export interface IStreak extends Document {
  email: string;
  dates: Date[];
  currentStreak: number;
  longestStreak: number;
  lastActive: Date | null;
}

const StreakSchema = new Schema<IStreak>({
  email: { type: String, required: true, unique: true, index: true },
  dates: [{ type: Date }],
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActive: { type: Date, default: null },
});

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function getYesterday(date: Date): Date {
  const d = getStartOfDay(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

export async function updateStreak(email: string): Promise<IStreak> {
  const { connectDB } = await import("@/lib/db");
  await connectDB();

  const Streak = mongoose.models.Streak || mongoose.model<IStreak>("Streak", StreakSchema);

  let streak = await Streak.findOne({ email });
  if (!streak) {
    streak = new Streak({ email, dates: [], currentStreak: 0, longestStreak: 0, lastActive: null });
  }

  const today = getStartOfDay(new Date());
  const lastActive = streak.lastActive ? getStartOfDay(new Date(streak.lastActive)) : null;

  if (lastActive && lastActive.getTime() === today.getTime()) {
    return streak;
  }

  const yesterday = getYesterday(today);

  if (lastActive && lastActive.getTime() === yesterday.getTime()) {
    streak.currentStreak += 1;
  } else {
    streak.currentStreak = 1;
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  streak.dates.push(today);
  streak.lastActive = today;

  await streak.save();
  return streak;
}

export async function getStreak(email: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const { connectDB } = await import("@/lib/db");
  await connectDB();

  const Streak = mongoose.models.Streak || mongoose.model<IStreak>("Streak", StreakSchema);

  const streak = await Streak.findOne({ email });
  if (!streak) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
  };
}
