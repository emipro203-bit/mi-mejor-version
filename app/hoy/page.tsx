"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { todayISO } from "@/lib/utils";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { getDailyQuote } from "@/lib/quotes";

const EMOJI_OPTIONS = ["🏃","🧘","💎","🥗","💧","📚","🌙","⚡","💪","🎯","🧠","❤️","🌿","✍️","🎵","🚿","🛏️","🥤","🏋️","🧹"];

interface Habit {
  id: string;
  name: string;
  icon: string;
  description?: string;
  streak: number;
  logs: { date: string; done: boolean }[];
}

type EditForm = { id?: string; name: string; icon: string; description: string };
const EMPTY_FORM: EditForm = { name: "", icon: "⚡", description: "" };

export default function HoyPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, boolean>>({});
  const [waterCups, setWaterCups] = useState(0);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [globalStreak, setGlobalStreak] = useState(0);
  const [waterGoalMl, setWaterGoalMl] = useState(2500);
  const [editingWaterGoal, setEditingWaterGoal] = useState(false);
  const [waterGoalInput, setWaterGoalInput] = useState("2500");
  const [upcomingEvents, setUpcomingEvents] = useState<{ id: string; title: string; date: string; color: string; type: string }[]>([]);

  const today = todayISO();
  const quote = getDailyQuote();

  const fetchData = useCallback(async () => {
    const [habitsRes, waterRes] = await Promise.all([
      fetch("/api/habits"),
      fetch(`/api/water?date=${today}`),
    ]);
    const habitsData = await habitsRes.json();
    const waterData = await waterRes.json();

    setHabits(habitsData);
    setWaterCups(waterData.cups || 0);

    const logs: Record<string, boolean> = {};
    for (const h of habitsData) {
      const todayLog = h.logs?.find(
        (l: { date: string }) =>
          new Date(l.date).toISOString().split("T")[0] === today
      );
      logs[h.id] = (todayLog as { done?: boolean })?.done || false;
    }
    setTodayLogs(logs);
    setLoading(false);
  }, [today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    fetch("/api/streak")
      .then(r => r.json())
      .then(d => setGlobalStreak(d.streak ?? 0))
      .catch(() => null);
    const saved = parseInt(localStorage.getItem("waterGoalMl") || "2500");
    setWaterGoalMl(saved);
    setWaterGoalInput(String(saved));

    // Fetch upcoming events (next 30 days)
    fetch("/api/events").then(r => r.ok ? r.json() : []).then((all: { id: string; title: string; date: string; color: string; type: string }[]) => {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const upcoming = all
        .filter(e => new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingEvents(upcoming);
    }).catch(() => null);
  }, []);

  const toggleHabit = async (habitId: string) => {
    const newDone = !todayLogs[habitId];
    setTodayLogs((prev) => ({ ...prev, [habitId]: newDone }));

    const res = await fetch("/api/habits/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: today, done: newDone }),
    });
    const data = await res.json();

    setHabits((prev) =>
      prev.map((h) => h.id === habitId ? { ...h, streak: data.streak } : h)
    );
  };

  const setWater = async (cups: number) => {
    setWaterCups(cups);
    await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, cups }),
    });
  };

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (h: Habit) => {
    setEditingId(h.id);
    setForm({ id: h.id, name: h.name, icon: h.icon || "⚡", description: h.description || "" });
  };

  const saveHabit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editingId) {
      await fetch("/api/habits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name: form.name, icon: form.icon, description: form.description }),
      });
    } else {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, icon: form.icon, description: form.description }),
      });
    }
    await fetchData();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSaving(false);
  };

  const deleteHabit = async (id: string) => {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const completedCount = Object.values(todayLogs).filter(Boolean).length;
  const dateLabel = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  });

  // Week strip: last 7 days
  const weekDays = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const habitPctForDay = (dayISO: string) => {
    if (habits.length === 0) return 0;
    const done = habits.reduce((acc, h) => {
      const log = h.logs?.find(l => new Date(l.date).toISOString().split("T")[0] === dayISO);
      return acc + (log?.done ? 1 : 0);
    }, 0);
    return done / habits.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm capitalize" style={{ color: "var(--muted)" }}>{dateLabel}</p>
        <h1 className="text-3xl font-bold mt-1" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Buenos días ✨
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: completedCount, label: "hábitos" },
          { value: waterCups, label: "vasos agua" },
          { value: `${habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0}%`, label: "completado" },
          { value: `🔥${globalStreak}`, label: "racha global" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => {
          const ds = day.toISOString().split("T")[0];
          const isToday = ds === today;
          const pct = habitPctForDay(ds);
          return (
            <div key={ds} className="flex flex-col items-center gap-1">
              <span className="text-[10px] capitalize" style={{ color: "var(--muted)" }}>
                {format(day, "EEE", { locale: es }).slice(0, 2)}
              </span>
              <div className="w-full aspect-square rounded-xl relative overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isToday ? "rgba(201,168,76,0.5)" : "var(--border)"}`,
                }}>
                {pct > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 transition-all"
                    style={{
                      height: `${pct * 100}%`,
                      background: pct === 1
                        ? "linear-gradient(0deg, rgba(76,175,125,0.5), rgba(76,175,125,0.2))"
                        : "linear-gradient(0deg, rgba(201,168,76,0.5), rgba(201,168,76,0.1))",
                    }}
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ color: isToday ? "var(--gold)" : "var(--foreground)", opacity: 0.8 }}>
                  {format(day, "d")}
                </span>
              </div>
              <span className="text-[9px]" style={{ color: pct > 0 ? (pct === 1 ? "#4CAF7D" : "var(--gold)") : "var(--muted)" }}>
                {pct > 0 ? `${Math.round(pct * 100)}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Upcoming events */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-4" style={{ color: "var(--muted)" }}>
            <p className="text-2xl mb-1">📅</p>
            <p className="text-sm">Sin eventos próximos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map(ev => {
              const evDate = new Date(ev.date);
              evDate.setHours(0, 0, 0, 0);
              const now = new Date(); now.setHours(0, 0, 0, 0);
              const diffDays = Math.round((evDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const typeIcon = ev.type === "reminder" ? "🔔" : ev.type === "goal" ? "🎯" : ev.type === "run" ? "🏃" : "📅";
              const diffLabel = diffDays === 0 ? "Hoy" : diffDays === 1 ? "Mañana" : `En ${diffDays} días`;
              return (
                <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{ background: `${ev.color}10`, border: `1px solid ${ev.color}25` }}>
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: `${ev.color}20` }}>
                    <span className="text-xs font-bold leading-none" style={{ color: ev.color }}>
                      {evDate.getDate()}
                    </span>
                    <span className="text-[9px] leading-none mt-0.5" style={{ color: ev.color }}>
                      {evDate.toLocaleString("es-MX", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                      {typeIcon} {ev.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: diffDays === 0 ? "var(--gold)" : "var(--muted)" }}>
                      {diffLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Habits checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hábitos de hoy</CardTitle>
            <button
              onClick={() => { setManaging(!managing); setForm(EMPTY_FORM); setEditingId(null); }}
              className="text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: managing ? "rgba(201,168,76,0.15)" : "var(--surface)",
                border: `1px solid ${managing ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
                color: managing ? "var(--gold)" : "var(--muted)",
              }}
            >
              {managing ? "✓ Listo" : "⚙️ Gestionar"}
            </button>
          </div>
        </CardHeader>

        {/* Manage mode: form */}
        {managing && (
          <div className="mb-4 p-3 rounded-xl space-y-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              {editingId ? "Editando hábito" : "Nuevo hábito"}
            </p>

            {/* Emoji picker */}
            <div>
              <p className="text-xs mb-2" style={{ color: "var(--muted-2, var(--muted))" }}>Ícono</p>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button key={e} onClick={() => setForm((f) => ({ ...f, icon: e }))}
                    className="w-9 h-9 rounded-lg text-lg transition-all"
                    style={{
                      background: form.icon === e ? "rgba(201,168,76,0.2)" : "var(--surface-2, var(--surface))",
                      border: `1px solid ${form.icon === e ? "rgba(201,168,76,0.5)" : "var(--border)"}`,
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <Input label="Nombre" placeholder="ej. Meditación" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Descripción (opcional)" placeholder="ej. 10 minutos al despertar"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

            <div className="flex gap-2">
              <Button onClick={saveHabit} disabled={saving || !form.name.trim()} size="sm" className="flex-1">
                {saving ? "..." : editingId ? "Guardar cambios" : "Agregar hábito"}
              </Button>
              {editingId && (
                <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
                  variant="ghost" size="sm">
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {habits.map((habit) => {
            const done = todayLogs[habit.id] || false;
            return (
              <div key={habit.id} className="flex items-center gap-2">
                <button
                  onClick={() => !managing && toggleHabit(habit.id)}
                  className="flex-1 flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: done ? "rgba(201, 168, 76, 0.1)" : "var(--surface)",
                    border: `1px solid ${done ? "rgba(201, 168, 76, 0.3)" : "var(--border)"}`,
                    cursor: managing ? "default" : "pointer",
                  }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: done ? "linear-gradient(135deg, var(--gold-dark), var(--gold))" : "transparent",
                      border: done ? "none" : "2px solid var(--border)",
                    }}
                  >
                    {done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg">{habit.icon || "⚡"}</span>
                  <span className="flex-1 text-sm font-medium" style={{
                    color: done ? "var(--gold)" : "var(--foreground)",
                    textDecoration: done ? "line-through" : "none",
                    opacity: done ? 0.7 : 1,
                  }}>
                    {habit.name}
                  </span>
                  {habit.streak > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201, 168, 76, 0.15)", color: "var(--gold)" }}>
                      🔥 {habit.streak}
                    </span>
                  )}
                </button>

                {/* Manage buttons */}
                {managing && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(habit)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100 opacity-60"
                      style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                      ✏️
                    </button>
                    <button onClick={() => deleteHabit(habit.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-100 opacity-60"
                      style={{ background: "rgba(224,92,92,0.1)", color: "var(--error)" }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add button in manage mode */}
          {managing && !editingId && (
            <button onClick={openNew}
              className="w-full p-3 rounded-xl text-sm transition-all mt-1"
              style={{ border: "1px dashed var(--border)", color: "var(--muted)" }}
            >
              + Agregar hábito
            </button>
          )}
        </div>
      </Card>

      {/* Water tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hidratación</CardTitle>
            <div className="flex items-center gap-2">
              {editingWaterGoal ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={waterGoalInput}
                    onChange={e => setWaterGoalInput(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg text-xs text-center outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--gold)", color: "var(--foreground)" }}
                    min={250} max={5000} step={250}
                  />
                  <span className="text-xs" style={{ color: "var(--muted)" }}>ml</span>
                  <button
                    onClick={() => {
                      const val = Math.max(250, Math.min(5000, parseInt(waterGoalInput) || 2500));
                      const rounded = Math.round(val / 250) * 250;
                      setWaterGoalMl(rounded);
                      setWaterGoalInput(String(rounded));
                      localStorage.setItem("waterGoalMl", String(rounded));
                      setEditingWaterGoal(false);
                    }}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: "rgba(201,168,76,0.2)", color: "var(--gold)" }}
                  >✓</button>
                  <button onClick={() => setEditingWaterGoal(false)} className="text-xs" style={{ color: "var(--muted)" }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setEditingWaterGoal(true)}
                  className="text-sm flex items-center gap-1"
                  style={{ color: "var(--muted)" }}>
                  {waterCups * 250} / {waterGoalMl.toLocaleString()} ml
                  <span className="text-xs opacity-50">✏️</span>
                </button>
              )}
            </div>
          </div>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, (waterCups * 250 / waterGoalMl) * 100)}%` }} />
          </div>
        </CardHeader>
        {(() => {
          const totalCups = Math.round(waterGoalMl / 250);
          return (
            <>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(totalCups, 5)}, 1fr)` }}>
                {Array.from({ length: totalCups }, (_, i) => (
                  <button key={i} onClick={() => setWater(i < waterCups ? i : i + 1)}
                    className="aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-150 active:scale-90"
                    style={{
                      background: i < waterCups ? "rgba(92, 155, 224, 0.2)" : "var(--surface)",
                      border: `1px solid ${i < waterCups ? "rgba(92, 155, 224, 0.4)" : "var(--border)"}`,
                    }}
                  >
                    💧
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: "var(--muted)" }}>
                {waterCups >= totalCups
                  ? "🎉 ¡Meta de hidratación alcanzada!"
                  : `${totalCups - waterCups} vasos para completar la meta`}
              </p>
            </>
          );
        })()}
      </Card>

      {/* Quote */}
      <div className="p-4 rounded-xl" style={{
        background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)",
        border: "1px solid rgba(201,168,76,0.15)",
      }}>
        <p className="text-sm italic text-center leading-relaxed" style={{ color: "var(--muted-2, var(--muted))" }}>
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </div>
  );
}
