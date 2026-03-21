import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

// Parse "7h 34min" or "7h" or "45min" → decimal hours
function parseDuration(val: string): number {
  const h = val.match(/(\d+)\s*h/);
  const m = val.match(/(\d+)\s*min/);
  const hours = h ? parseInt(h[1]) : 0;
  const mins = m ? parseInt(m[1]) : 0;
  return Math.round((hours + mins / 60) * 10) / 10;
}

// Parse "11:10 PM" or "6:50 AM" → "23:10" / "06:50"
function parseTime12(val: string): string {
  const match = val.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "00:00";
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${m}`;
}

// "Mar 15-21" → array of 7 Date objects; infer year from current date
function parseWeekRange(val: string): Date[] {
  const match = val.trim().match(/^(\w{3})\s+(\d+)-(\d+)$/);
  if (!match) return [];
  const month = MONTHS[match[1]];
  if (month === undefined) return [];
  const startDay = parseInt(match[2]);
  const endDay = parseInt(match[3]);

  const now = new Date();
  let year = now.getFullYear();
  // If the month is ahead of current month, it's the previous year
  if (month > now.getMonth()) year -= 1;

  const dates: Date[] = [];
  for (let d = startDay; d <= endDay; d++) {
    dates.push(new Date(Date.UTC(year, month, d)));
  }
  return dates;
}

// Parse TSV or CSV line
function parseLine(line: string, sep: string): string[] {
  if (sep === "\t") return line.split("\t").map((v) => v.trim());
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === "," && !inQuotes) { result.push(current); current = ""; }
    else { current += line[i]; }
  }
  result.push(current);
  return result.map((v) => v.trim().replace(/^"|"$/g, ""));
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const text = await file.text();
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ imported: 0, skipped: 0 });

  // Detect separator
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = parseLine(lines[0], sep);

  let imported = 0;
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const values = parseLine(line, sep);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });

    try {
      // --- Weekly summary format: "Mar 15-21" ---
      const dateVal = row["Date"] ?? "";
      if (/^\w{3}\s+\d+-\d+$/.test(dateVal.trim())) {
        const days = parseWeekRange(dateVal);
        if (days.length === 0) { skipped++; continue; }

        const durationStr = row["Avg Duration"] ?? "";
        const bedtimeStr = row["Avg Bedtime"] ?? "";
        const wakeStr = row["Avg Wake Time"] ?? "";

        const hours = parseDuration(durationStr);
        if (hours <= 0 || hours > 16) { skipped++; continue; }

        const bedtime = parseTime12(bedtimeStr);
        const wakeTime = parseTime12(wakeStr);

        for (const date of days) {
          await prisma.sleepLog.upsert({
            where: { userId_date: { userId, date } },
            update: { bedtime, wakeTime, hours, quality: 3 },
            create: { userId, date, bedtime, wakeTime, hours, quality: 3 },
          });
          imported++;
        }
        continue;
      }

      // --- Daily format with timestamps ---
      const beginTs = row["Begin Timestamp"] ?? row["Start Time"] ?? row["Sleep Start"] ?? "";
      if (!beginTs) { skipped++; continue; }

      const tsMatch = beginTs.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})/);
      if (!tsMatch) { skipped++; continue; }

      const date = new Date(tsMatch[1] + "T12:00:00Z");
      const bedtime = tsMatch[2];

      const endTs = row["End Timestamp"] ?? row["Wake Time"] ?? row["Sleep End"] ?? "";
      const endMatch = endTs.match(/(\d{2}:\d{2})/);
      const wakeTime = endMatch ? endMatch[1] : "06:00";

      const totalStr = row["Total Sleep Time"] ?? row["Hrs. of Sleep"] ?? "";
      let hours: number;
      if (totalStr) {
        const n = parseFloat(totalStr);
        hours = n < 24 ? Math.round(n * 10) / 10 : Math.round((n / 3600) * 10) / 10;
      } else {
        const [bH, bM] = bedtime.split(":").map(Number);
        const [wH, wM] = wakeTime.split(":").map(Number);
        let bedMins = bH * 60 + bM;
        let wakeMins = wH * 60 + wM;
        if (wakeMins < bedMins) wakeMins += 24 * 60;
        hours = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
      }

      if (hours <= 0 || hours > 16) { skipped++; continue; }

      const scoreStr = row["Combined Score"] ?? row["Adult Sleep Rating"] ?? row["Sleep Score"] ?? "";
      const s = parseFloat(scoreStr);
      const quality = isNaN(s) ? 3 : s >= 80 ? 5 : s >= 60 ? 4 : s >= 40 ? 3 : s >= 20 ? 2 : 1;

      const bbStr = row["Body Battery Charge"] ?? row["Body Battery"] ?? "";
      const bodyBattery = bbStr && !isNaN(parseFloat(bbStr)) ? Math.round(parseFloat(bbStr)) : null;

      const stressStr = row["Avg Stress during sleep"] ?? row["Average Stress"] ?? "";
      const stressScore = stressStr && !isNaN(parseFloat(stressStr)) ? Math.round(parseFloat(stressStr)) : null;

      await prisma.sleepLog.upsert({
        where: { userId_date: { userId, date } },
        update: { bedtime, wakeTime, hours, quality, bodyBattery, stressScore },
        create: { userId, date, bedtime, wakeTime, hours, quality, bodyBattery, stressScore },
      });
      imported++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ imported, skipped });
}
