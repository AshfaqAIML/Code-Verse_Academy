export type DashboardStats = {
  streak: number;
  longestStreak: number;
  xp: number;
  completed: number;
};

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readPracticeMemory(): { completed: string[]; practiceDates: string[] } {
  const storage = getStorage();
  if (!storage) return { completed: [], practiceDates: [] };
  try {
    const raw = storage.getItem("codeverse-practice-memory");
    if (!raw) return { completed: [], practiceDates: [] };
    const parsed = JSON.parse(raw);
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      practiceDates: Array.isArray(parsed.practiceDates) ? parsed.practiceDates : [],
    };
  } catch {
    return { completed: [], practiceDates: [] };
  }
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calculateStreak(practiceDates: string[]): number {
  const dates = new Set(practiceDates);
  let streak = 0;
  const cursor = new Date();
  while (dates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateLongestStreak(practiceDates: string[]): number {
  if (!practiceDates.length) return 0;
  const unique = [...new Set(practiceDates)].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getDashboardStats(): DashboardStats {
  const memory = readPracticeMemory();
  const streak = calculateStreak(memory.practiceDates);
  const longestStreak = calculateLongestStreak(memory.practiceDates);
  const completed = memory.completed.length;
  const xp = completed * 50;
  return { streak, longestStreak, xp, completed };
}

export type MonthActivity = {
  year: number;
  month: number;
  days: { date: number; active: boolean }[];
};

export function getMonthActivity(year: number, month: number): MonthActivity {
  const memory = readPracticeMemory();
  const dates = new Set(memory.practiceDates);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: { date: number; active: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date: d, active: dates.has(key) });
  }
  return { year, month, days };
}

export type HomeStats = {
  label: string;
  value: string;
  iconName: string;
};

export function getHomeStats(): HomeStats[] {
  const memory = readPracticeMemory();
  const streak = calculateStreak(memory.practiceDates);
  const completed = memory.completed.length;
  const practiceDays = memory.practiceDates.length;
  const xp = completed * 50;

  const hasData = completed > 0 || practiceDays > 0;

  if (hasData) {
    return [
      { label: "Lessons completed", value: String(completed), iconName: "BadgeCheck" },
      { label: "Day streak", value: String(streak), iconName: "Flame" },
      { label: "Practice sessions", value: String(practiceDays), iconName: "Code2" },
      { label: "XP earned", value: String(xp), iconName: "Trophy" },
    ];
  }

  return [
    { label: "Active learners", value: "128K", iconName: "Users" },
    { label: "Lessons completed", value: "3.4M", iconName: "BadgeCheck" },
    { label: "Daily code runs", value: "92K", iconName: "Code2" },
    { label: "Career wins", value: "18K", iconName: "Trophy" },
  ];
}
