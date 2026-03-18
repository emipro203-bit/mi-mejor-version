"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

interface HabitLog { habitId: string; date: string; done: boolean; }
interface Habit { id: string; name: string; icon: string; streak: number; logs: HabitLog[]; }
interface SleepLog { date: string; hours: number; quality: number; bodyBattery?: number; }
interface RunSession { date: string; distanceKm: number; durationMin: number; }

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [sleep, setSleep] = useState<SleepLog[]>([]);
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/habits").then(r => r.json()),
      fetch("/api/sleep").then(r => r.json()),
      fetch("/api/run").then(r => r.json()),
    ]).then(([h, s, r]) => {
      setHabits(h); setSleep(s); setRuns(r);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );

  // ── Heatmap últimos 30 días ──
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  const habitCompletionByDay = last30.map(day => {
    const ds = day.toISOString().split("T")[0];
    const total = habits.length;
    const done = habits.reduce((acc, h) => {
      const log = h.logs?.find((l: HabitLog) => new Date(l.date).toISOString().split("T")[0] === ds);
      return acc + ((log as HabitLog | undefined)?.done ? 1 : 0);
    }, 0);
    return { date: ds, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  // ── Mejor racha ──
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const topStreakHabit = habits.find(h => h.streak === bestStreak);

  // ── Promedio hábitos esta semana ──
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: new Date() });
  const weekAvg = weekDays.length > 0
    ? Math.round(weekDays.reduce((acc, day) => {
        const ds = day.toISOString().split("T")[0];
        const done = habits.reduce((a, h) => {
          const log = h.logs?.find((l: HabitLog) => new Date(l.date).toISOString().split("T")[0] === ds);
          return a + ((log as HabitLog | undefined)?.done ? 1 : 0);
        }, 0);
        return acc + (habits.length > 0 ? done / habits.length : 0);
      }, 0) / weekDays.length * 100)
    : 0;

  // ── Sueño últimos 14 días ──
  const sleepChart = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const ds = day.toISOString().split("T")[0];
    const log = sleep.find(s => new Date(s.date).toISOString().split("T")[0] === ds);
    return { name: format(day, "d/M"), hours: log?.hours || 0, quality: log?.quality || 0 };
  });
  const avgSleep = sleep.slice(0, 14).length > 0
    ? (sleep.slice(0, 14).reduce((a, s) => a + s.hours, 0) / sleep.slice(0, 14).length).toFixed(1)
    : "—";

  // ── Running últimas 8 semanas ──
  const runChart = Array.from({ length: 8 }, (_, i) => {
    const wStart = startOfWeek(subDays(new Date(), (7 - i) * 7), { weekStartsOn: 1 });
    const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
    const weekRuns = runs.filter(r => { const d = new Date(r.date); return d >= wStart && d <= wEnd; });
    return {
      name: format(wStart, "d/M", { locale: es }),
      km: Math.round(weekRuns.reduce((a, r) => a + r.distanceKm, 0) * 10) / 10,
      sesiones: weekRuns.length,
    };
  });

  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Estadísticas 📊
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Tu progreso en números</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Mejor racha", value: `🔥 ${bestStreak}`, sub: topStreakHabit?.name || "—" },
          { label: "Esta semana", value: `${weekAvg}%`, sub: "hábitos promedio" },
          { label: "Sueño promedio", value: `${avgSleep}h`, sub: "últimas 2 semanas" },
          { label: "Km totales", value: `${runs.reduce((a, r) => a + r.distanceKm, 0).toFixed(1)}`, sub: "todos los tiempos" },
        ].map(k => (
          <div key={k.label} className="card">
            <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{k.label}</div>
            <div className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>{k.value}</div>
            <div className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Heatmap hábitos 30 días */}
      <Card>
        <CardHeader>
          <CardTitle>Heatmap de hábitos — 30 días</CardTitle>
        </CardHeader>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
          {habitCompletionByDay.map(d => (
            <div key={d.date} title={`${d.date}: ${d.done}/${d.total} hábitos`}
              className="aspect-square rounded-md transition-all"
              style={{
                background: d.pct === 0
                  ? "var(--border)"
                  : d.pct < 50
                  ? "rgba(201,168,76,0.25)"
                  : d.pct < 80
                  ? "rgba(201,168,76,0.55)"
                  : "rgba(201,168,76,0.9)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          {["0%", "1-49%", "50-79%", "80%+"].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{
                background: i === 0 ? "var(--border)" : i === 1 ? "rgba(201,168,76,0.25)" : i === 2 ? "rgba(201,168,76,0.55)" : "rgba(201,168,76,0.9)",
              }} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Streaks por hábito */}
      <Card>
        <CardHeader><CardTitle>Rachas actuales 🔥</CardTitle></CardHeader>
        <div className="space-y-2">
          {[...habits].sort((a, b) => b.streak - a.streak).map(h => (
            <div key={h.id} className="flex items-center gap-3">
              <span className="text-base">{h.icon || "⚡"}</span>
              <span className="flex-1 text-sm" style={{ color: "var(--foreground)" }}>{h.name}</span>
              <div className="flex items-center gap-1">
                <div className="h-2 rounded-full" style={{
                  width: Math.max(8, (h.streak / Math.max(1, bestStreak)) * 80),
                  background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                }} />
                <span className="text-xs font-bold w-12 text-right" style={{ color: "var(--gold)" }}>
                  {h.streak > 0 ? `🔥 ${h.streak}` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sueño 14 días */}
      <Card>
        <CardHeader><CardTitle>Sueño últimos 14 días</CardTitle></CardHeader>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepChart} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}h`, "Sueño"]} />
              <Bar dataKey="hours" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Running 8 semanas */}
      <Card>
        <CardHeader><CardTitle>Running últimas 8 semanas</CardTitle></CardHeader>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={runChart} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} km`, "Distancia"]} />
              <Line type="monotone" dataKey="km" stroke="var(--gold)" strokeWidth={2} dot={{ fill: "var(--gold)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
