"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { todayISO } from "@/lib/utils";

const MOTIVATIONAL_QUOTES = [
  "Cada día es una nueva oportunidad de convertirte en la mejor versión de ti mismo.",
  "El éxito no es final, el fracaso no es fatal. Lo que cuenta es el coraje de continuar.",
  "Pequeñas acciones consistentes crean grandes resultados.",
  "Tu único competidor eres el tú de ayer.",
  "La disciplina es el puente entre metas y logros.",
];

interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  logs: { date: string; done: boolean }[];
}

export default function HoyPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, boolean>>({});
  const [waterCups, setWaterCups] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = todayISO();
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

  const fetchData = useCallback(async () => {
    const [habitsRes, waterRes] = await Promise.all([
      fetch("/api/habits"),
      fetch(`/api/water?date=${today}`),
    ]);
    const habitsData = await habitsRes.json();
    const waterData = await waterRes.json();

    setHabits(habitsData);
    setWaterCups(waterData.cups || 0);

    // Build today's logs map
    const logs: Record<string, boolean> = {};
    for (const h of habitsData) {
      const todayLog = h.logs?.find(
        (l: { date: string; done: boolean }) =>
          new Date(l.date).toISOString().split("T")[0] === today
      );
      logs[h.id] = todayLog?.done || false;
    }
    setTodayLogs(logs);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleHabit = async (habitId: string) => {
    const newDone = !todayLogs[habitId];
    setTodayLogs((prev) => ({ ...prev, [habitId]: newDone }));

    await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: today, done: newDone }),
    });

    // Refresh to get updated streak
    fetchData();
  };

  const setWater = async (cups: number) => {
    setWaterCups(cups);
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, cups }),
    });
  };

  const completedCount = Object.values(todayLogs).filter(Boolean).length;
  const dateLabel = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm capitalize" style={{ color: "#6B6355" }}>
          {dateLabel}
        </p>
        <h1
          className="text-3xl font-bold mt-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #C9A84C 0%, #E8C875 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Buenos días ✨
        </h1>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div
            className="text-2xl font-bold"
            style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif" }}
          >
            {completedCount}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6B6355" }}>
            hábitos
          </div>
        </div>
        <div className="card text-center">
          <div
            className="text-2xl font-bold"
            style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif" }}
          >
            {waterCups}
          </div>
          <div className="text-xs mt-1" style={{ color: "#6B6355" }}>
            vasos agua
          </div>
        </div>
        <div className="card text-center">
          <div
            className="text-2xl font-bold"
            style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif" }}
          >
            {habits.length > 0
              ? Math.round((completedCount / habits.length) * 100)
              : 0}
            %
          </div>
          <div className="text-xs mt-1" style={{ color: "#6B6355" }}>
            completado
          </div>
        </div>
      </div>

      {/* Habits checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Hábitos de hoy</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {habits.map((habit) => {
            const done = todayLogs[habit.id] || false;
            return (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: done
                    ? "rgba(201, 168, 76, 0.1)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${done ? "rgba(201, 168, 76, 0.3)" : "#2E2A22"}`,
                }}
              >
                {/* Checkbox */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: done
                      ? "linear-gradient(135deg, #9A7A35, #C9A84C)"
                      : "transparent",
                    border: done ? "none" : "2px solid #2E2A22",
                  }}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Icon + name */}
                <span className="text-lg">{habit.icon || "⚡"}</span>
                <span
                  className="flex-1 text-sm font-medium"
                  style={{
                    color: done ? "#C9A84C" : "#F5F0E8",
                    textDecoration: done ? "line-through" : "none",
                    opacity: done ? 0.7 : 1,
                  }}
                >
                  {habit.name}
                </span>

                {/* Streak */}
                {habit.streak > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(201, 168, 76, 0.15)",
                      color: "#C9A84C",
                    }}
                  >
                    🔥 {habit.streak}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Water tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hidratación</CardTitle>
            <span className="text-sm" style={{ color: "#6B6355" }}>
              {waterCups * 250} / 2,500 ml
            </span>
          </div>
          <div className="progress-bar mt-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, (waterCups / 10) * 100)}%` }}
            />
          </div>
        </CardHeader>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, i) => (
            <button
              key={i}
              onClick={() => setWater(i < waterCups ? i : i + 1)}
              className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-150 active:scale-90"
              style={{
                background:
                  i < waterCups
                    ? "rgba(92, 155, 224, 0.2)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${i < waterCups ? "rgba(92, 155, 224, 0.4)" : "#2E2A22"}`,
              }}
            >
              💧
            </button>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "#6B6355" }}>
          {waterCups >= 10
            ? "🎉 ¡Meta de hidratación alcanzada!"
            : `${10 - waterCups} vasos para completar la meta`}
        </p>
      </Card>

      {/* Motivational quote */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <p
          className="text-sm italic text-center leading-relaxed"
          style={{ color: "#A89880" }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
