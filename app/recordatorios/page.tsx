"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { format, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface Reminder {
  id: string;
  title: string;
  date: string;
  color: string;
  type: string;
  done: boolean;
}

const REMINDER_COLORS = ["#C9A84C", "#5C9BE0", "#4CAF7D", "#E05C5C", "#E0945C", "#9B59B6"];

const TYPE_OPTIONS = [
  { value: "reminder", label: "🔔 Recordatorio" },
  { value: "goal", label: "🎯 Meta" },
  { value: "event", label: "📅 Evento" },
  { value: "run", label: "🏃 Carrera" },
];

export default function RecordatoriosPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    color: "#C9A84C",
    type: "reminder",
  });
  const [saving, setSaving] = useState(false);

  const fetchReminders = useCallback(async () => {
    const res = await fetch("/api/events");
    const data: Reminder[] = await res.json();
    setReminders(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  const saveReminder = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchReminders();
    setShowForm(false);
    setForm({ title: "", date: format(new Date(), "yyyy-MM-dd"), color: "#C9A84C", type: "reminder" });
    setSaving(false);
  };

  const deleteReminder = async (id: string) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    fetchReminders();
  };

  const toggleDone = async (r: Reminder) => {
    await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, title: r.title, date: r.date, color: r.color, done: !r.done }),
    });
    fetchReminders();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
    </div>
  );

  const today = startOfDay(new Date());
  const upcoming = reminders.filter(r => !isBefore(startOfDay(new Date(r.date)), today) && !r.done)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = reminders.filter(r => isBefore(startOfDay(new Date(r.date)), today) || r.done)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeLabel = (type: string) => TYPE_OPTIONS.find(t => t.value === type)?.label || "📅";

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
            Recordatorios 🔔
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Se sincronizan con el calendario
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "linear-gradient(135deg, var(--gold-dark), var(--gold))", color: "#0D0B08" }}
        >
          + Nuevo
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
            Nuevo recordatorio
          </p>
          <div className="space-y-3">
            <input
              placeholder="¿Qué quieres recordar?"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              onFocus={e => (e.target.style.borderColor = "var(--gold)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-2, var(--border))", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                {TYPE_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div className="flex gap-2">
              {REMINDER_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{ background: c, outline: form.color === c ? "2px solid var(--foreground)" : "none", outlineOffset: 2 }}
                />
              ))}
            </div>

            <button
              onClick={saveReminder}
              disabled={saving || !form.title || !form.date}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                color: "#0D0B08",
                opacity: (!form.title || !form.date) ? 0.5 : 1,
              }}
            >
              {saving ? "Guardando..." : "Guardar recordatorio"}
            </button>
          </div>
        </Card>
      )}

      {/* Upcoming */}
      <Card>
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
          Próximos ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-6" style={{ color: "var(--muted)" }}>
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm">Sin recordatorios próximos</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-xs mt-2"
              style={{ color: "var(--gold)" }}
            >
              + Agregar uno
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(r => {
              const daysUntil = Math.ceil((startOfDay(new Date(r.date)).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isToday = daysUntil === 0;
              const isTomorrow = daysUntil === 1;
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: `${r.color}10`, border: `1px solid ${r.color}30` }}>
                  <button
                    onClick={() => toggleDone(r)}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                    style={{ border: `2px solid ${r.color}`, background: "transparent" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{r.title}</p>
                    <p className="text-xs" style={{ color: r.color }}>
                      {isToday ? "🔴 Hoy" : isTomorrow ? "🟡 Mañana" : format(new Date(r.date), "EEEE d 'de' MMM", { locale: es })}
                      {" · "}{typeLabel(r.type)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{ background: `${r.color}20`, color: r.color }}>
                      {format(new Date(r.date), "d")}
                    </div>
                    <button onClick={() => deleteReminder(r.id)}
                      className="opacity-30 hover:opacity-100 text-xs transition-opacity"
                      style={{ color: "var(--error, #E05C5C)" }}>
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Past / Done */}
      {past.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
            Pasados / Completados
          </h2>
          <div className="space-y-2">
            {past.slice(0, 10).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl opacity-50"
                style={{ border: "1px solid var(--border)" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "var(--foreground)", textDecoration: r.done ? "line-through" : "none" }}>
                    {r.title}
                  </p>
                  <p className="text-xs capitalize" style={{ color: "var(--muted)" }}>
                    {format(new Date(r.date), "d 'de' MMM yyyy", { locale: es })}
                  </p>
                </div>
                <button onClick={() => deleteReminder(r.id)}
                  className="opacity-30 hover:opacity-100 text-xs transition-opacity"
                  style={{ color: "var(--error, #E05C5C)" }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
