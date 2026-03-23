"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday,
} from "date-fns";
import { es } from "date-fns/locale";

interface CalEvent { id: string; title: string; date: string; color: string; type: string; done: boolean; }
interface HabitLog { date: string; done: boolean; }
interface Habit { id: string; logs: HabitLog[]; }
interface RunSession { id: string; date: string; distanceKm: number; durationMin: number; type: string; }

const EVENT_COLORS = ["#C9A84C", "#5C9BE0", "#4CAF7D", "#E05C5C", "#E0945C", "#9B59B6"];

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", color: "#C9A84C", type: "event" });
  const [saving, setSaving] = useState(false);

  const monthKey = format(currentMonth, "yyyy-MM");

  const fetchData = useCallback(async () => {
    try {
      const [evRes, habRes, runRes] = await Promise.all([
        fetch(`/api/events?month=${monthKey}`),
        fetch("/api/habits"),
        fetch("/api/run"),
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (habRes.ok) setHabits(await habRes.json());
      if (runRes.ok) setRuns(await runRes.json());
    } catch (e) {
      console.error("Calendar fetchData error:", e);
    }
  }, [monthKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Grid: semanas completas del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // % hábitos completados por día
  const habitPctByDay = (day: Date) => {
    const ds = day.toISOString().split("T")[0];
    if (habits.length === 0) return 0;
    const done = habits.reduce((acc, h) => {
      const log = h.logs?.find((l: HabitLog) => new Date(l.date).toISOString().split("T")[0] === ds);
      return acc + ((log as HabitLog | undefined)?.done ? 1 : 0);
    }, 0);
    return done / habits.length;
  };

  // Extract the UTC date string (YYYY-MM-DD) regardless of time component
  const utcDateStr = (d: string) => new Date(d).toISOString().split("T")[0];

  const eventsForDay = (day: Date) =>
    events.filter(e => utcDateStr(e.date) === format(day, "yyyy-MM-dd"));

  const runsForDay = (day: Date) =>
    runs.filter(r => utcDateStr(r.date) === format(day, "yyyy-MM-dd"));

  const saveEvent = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchData();
    setShowForm(false);
    setForm({ title: "", date: "", color: "#C9A84C", type: "event" });
    setSaving(false);
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const selectedRuns = selectedDay ? runsForDay(selectedDay) : [];
  const selectedHabitPct = selectedDay ? habitPctByDay(selectedDay) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Calendario 📅
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: "var(--muted)" }}>
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <button
          onClick={() => { setSelectedDay(null); setShowForm(!showForm); setForm(f => ({ ...f, date: format(new Date(), "yyyy-MM-dd") })); }}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--gold))", color: "#0D0B08" }}
        >
          + Evento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
            Nuevo evento
          </p>
          <div className="space-y-3">
            <input placeholder="Título del evento..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="event">📅 Evento</option>
                <option value="reminder">🔔 Recordatorio</option>
                <option value="goal">🎯 Meta</option>
                <option value="run">🏃 Carrera</option>
              </select>
            </div>
            {/* Color picker */}
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, outline: form.color === c ? `2px solid var(--foreground)` : "none", outlineOffset: 2 }}
                />
              ))}
            </div>
            <button onClick={saveEvent} disabled={saving || !form.title || !form.date}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--gold))", color: "#0D0B08", opacity: (!form.title || !form.date) ? 0.5 : 1 }}
            >
              {saving ? "Guardando..." : "Guardar evento"}
            </button>
          </div>
        </Card>
      )}

      {/* Calendar grid */}
      <Card>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            ‹
          </button>
          <span className="text-sm font-semibold capitalize" style={{ color: "var(--foreground)" }}>
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </span>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["L", "M", "X", "J", "V", "S", "D"].map(d => (
            <div key={d} className="text-center text-sm font-medium py-1" style={{ color: "var(--muted)" }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = selectedDay && isSameDay(day, selectedDay);
            const dayEvents = eventsForDay(day);
            const dayRuns = inMonth ? runsForDay(day) : [];
            const habitPct = inMonth ? habitPctByDay(day) : 0;

            return (
              <button key={day.toISOString()} onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date("1900")) ? null : day)}
                className="relative flex flex-col items-center p-2 rounded-xl transition-all min-h-[56px]"
                style={{
                  opacity: inMonth ? 1 : 0.25,
                  background: selected ? "rgba(201,168,76,0.15)" : today ? "rgba(201,168,76,0.06)" : "transparent",
                  border: selected ? "1px solid rgba(201,168,76,0.5)" : today ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
                }}
              >
                {/* Day number */}
                <span className="text-sm font-semibold" style={{ color: today ? "var(--gold)" : "var(--foreground)" }}>
                  {format(day, "d")}
                </span>

                {/* Habit bar */}
                {inMonth && habitPct > 0 && (
                  <div className="w-full mt-1 rounded-full overflow-hidden" style={{ height: 3, background: "var(--border)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${habitPct * 100}%`,
                      background: habitPct === 1 ? "#4CAF7D" : "var(--gold)",
                    }} />
                  </div>
                )}

                {/* Run indicator */}
                {dayRuns.length > 0 && (
                  <span className="text-xs leading-none mt-0.5">🏃</span>
                )}

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map(ev => (
                      <div key={ev.id} className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected day detail */}
      {selectedDay && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold capitalize" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
              {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            {selectedHabitPct > 0 && (
              <span className="text-xs px-2 py-1 rounded-full" style={{
                background: selectedHabitPct === 1 ? "rgba(76,175,125,0.15)" : "rgba(201,168,76,0.15)",
                color: selectedHabitPct === 1 ? "#4CAF7D" : "var(--gold)",
              }}>
                {Math.round(selectedHabitPct * 100)}% hábitos
              </span>
            )}
          </div>

          <div className="space-y-2">
            {/* Runs */}
            {selectedRuns.map(run => (
              <div key={run.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: "rgba(252,76,2,0.08)", border: "1px solid rgba(252,76,2,0.2)" }}>
                <span className="text-base">🏃</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {run.type} · {run.distanceKm} km
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {Math.floor(run.durationMin)}m {Math.round((run.durationMin % 1) * 60)}s
                    {run.distanceKm > 0 ? ` · ${(run.durationMin / run.distanceKm).toFixed(1)} min/km` : ""}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(252,76,2,0.15)", color: "#FC4C02" }}>
                  Strava
                </span>
              </div>
            ))}

            {/* Events */}
            {selectedEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background: `${ev.color}12`, border: `1px solid ${ev.color}30` }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                <span className="flex-1 text-sm" style={{ color: "var(--foreground)" }}>{ev.title}</span>
                <button onClick={() => deleteEvent(ev.id)} className="text-xs opacity-40 hover:opacity-100" style={{ color: "var(--error)" }}>✕</button>
              </div>
            ))}

            {selectedRuns.length === 0 && selectedEvents.length === 0 && (
              <div className="text-center py-4" style={{ color: "var(--muted)" }}>
                <p className="text-sm">Sin eventos</p>
                <button onClick={() => {
                  if (!selectedDay) return;
                  setForm(f => ({ ...f, date: format(selectedDay, "yyyy-MM-dd") }));
                  setShowForm(true);
                }} className="text-xs mt-1" style={{ color: "var(--gold)" }}>
                  + Agregar evento
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upcoming events */}
      {events.filter(e => utcDateStr(e.date) >= format(new Date(), "yyyy-MM-dd")).length > 0 && (
        <Card>
          <h2 className="text-base font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
            Próximos eventos
          </h2>
          <div className="space-y-2">
            {events
              .filter(e => utcDateStr(e.date) >= format(new Date(), "yyyy-MM-dd"))
              .slice(0, 5)
              .map(ev => {
                const evDate = new Date(utcDateStr(ev.date) + "T12:00:00");
                return (
                <div key={ev.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: `${ev.color}20`, color: ev.color }}>
                    {format(evDate, "d")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{ev.title}</p>
                    <p className="text-xs capitalize" style={{ color: "var(--muted)" }}>
                      {format(evDate, "EEEE d MMM", { locale: es })}
                    </p>
                  </div>
                  <button onClick={() => deleteEvent(ev.id)} className="opacity-30 hover:opacity-100 text-xs" style={{ color: "var(--error)" }}>✕</button>
                </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}
