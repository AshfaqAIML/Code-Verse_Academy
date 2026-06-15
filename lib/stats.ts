export type DashboardStats = {
  streak: number;
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
    return raw ? JSON.parse(raw) : { completed: [], practiceDates: [] };
  } catch {
    return { completed: [], practiceDates: [] };
  }
}

function calculateStreak(practiceDates: string[]): number {
  const dates = new Set(practiceDates);
  let streak = 0;
  const cursor = new Date();
  function dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  while (dates.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getDashboardStats(): DashboardStats {
  const memory = readPracticeMemory();
  const streak = calculateStreak(memory.practiceDates);
  const completed = memory.completed.length;
  const xp = completed * 50;
  return { streak, xp, completed };
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
