import { prisma } from "./prisma";

export async function computeGlobalStreak(userId: string): Promise<number> {
  const logs = await prisma.habitLog.findMany({
    where: { done: true, habit: { userId } },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const dateSet = new Set(logs.map(l => l.date.toISOString().split("T")[0]));
  const dates = Array.from(dateSet).sort().reverse();

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const dateStr of dates) {
    const logDate = new Date(dateStr);
    logDate.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 1) { streak++; current = logDate; } else break;
  }

  return streak;
}
