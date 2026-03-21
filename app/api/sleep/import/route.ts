import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/session";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += line[i];
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "");
      });
      return row;
    })
    .filter((row) => Object.values(row).some((v) => v));
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") return row[key];
  }
  return "";
}

function parseTimestamp(ts: string): { date: Date; time: string } | null {
  // Handles "2024-01-15 22:30:00", "2024-01-15T22:30:00", "01/15/2024 22:30"
  const clean = ts.trim();
  const match = clean.match(/(\d{4}[-/]\d{2}[-/]\d{2})[T\s](\d{2}:\d{2})/) ||
    clean.match(/(\d{2}[-/]\d{2}[-/]\d{4})[T\s](\d{2}:\d{2})/);
  if (!match) return null;
  const datePart = match[1].replace(/\//g, "-");
  const timePart = match[2];
  return {
    date: new Date(datePart + "T12:00:00Z"),
    time: timePart,
  };
}

function sleepDurationToHours(value: string): number {
  const n = parseFloat(value);
  if (isNaN(n)) return 0;
  // Garmin exports in seconds (e.g. 28800 = 8h); if < 24 assume already hours
  return n < 24 ? Math.round(n * 10) / 10 : Math.round((n / 3600) * 10) / 10;
}

function scoreToQuality(score: string): number {
  const s = parseFloat(score);
  if (isNaN(s)) return 3;
  // Garmin scores 0–100 → quality 1–5
  if (s >= 80) return 5;
  if (s >= 60) return 4;
  if (s >= 40) return 3;
  if (s >= 20) return 2;
  return 1;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const beginTs = getField(row, "Begin Timestamp", "Start Time", "Sleep Start", "Timestamp", "Date");
      if (!beginTs) { skipped++; continue; }

      const parsed = parseTimestamp(beginTs);
      if (!parsed) { skipped++; continue; }

      const { date, time: bedtime } = parsed;

      const endTs = getField(row, "End Timestamp", "Wake Time", "Sleep End", "End Time");
      const wakeTime = endTs ? (parseTimestamp(endTs)?.time ?? "06:00") : "06:00";

      const totalSleepStr = getField(row, "Total Sleep Time", "Total Sleep (seconds)", "Hrs. of Sleep", "Sleep Time (seconds)");
      let hours: number;
      if (totalSleepStr) {
        hours = sleepDurationToHours(totalSleepStr);
      } else {
        const [bH, bM] = bedtime.split(":").map(Number);
        const [wH, wM] = wakeTime.split(":").map(Number);
        let bedMins = bH * 60 + bM;
        let wakeMins = wH * 60 + wM;
        if (wakeMins < bedMins) wakeMins += 24 * 60;
        hours = Math.round(((wakeMins - bedMins) / 60) * 10) / 10;
      }

      if (hours <= 0 || hours > 16) { skipped++; continue; }

      const scoreStr = getField(row, "Combined Score", "Adult Sleep Rating", "Sleep Score", "Quality");
      const quality = scoreStr ? scoreToQuality(scoreStr) : 3;

      const bbStr = getField(row, "Body Battery Charge", "Body Battery (End of Sleep)", "Body Battery");
      const bodyBattery = bbStr && !isNaN(parseFloat(bbStr)) ? Math.round(parseFloat(bbStr)) : null;

      const stressStr = getField(row, "Avg Stress during sleep", "Average Stress", "Stress Score");
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
