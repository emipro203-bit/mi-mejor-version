"use client";

import { useEffect, useState, useCallback } from "react";
import { format, addWeeks, subWeeks, startOfISOWeek } from "date-fns";
import { es } from "date-fns/locale";

interface HabitBreakdown {
  id: string;
  name: string;
  icon: string;
  daysCompleted: number;
}

interface GoalStat {
  id: string;
  name: string;
  area: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  pct: number;
}

interface WeekData {
  weekStart: string;
  weekEnd: string;
  habits: { completed: number; total: number; rate: number; breakdown: HabitBreakdown[] };
  running: { sessions: number; km: number };
  sleep: { nights: number; avgHours: number | null };
  water: { fullDays: number };
  goals: GoalStat[];
  note: string;
}

const AREA_ICONS: Record<string, string> = {
  Running: "🏃", Negocio: "💎", Salud: "❤️",
  Personal: "🌟", Finanzas: "💰", Aprendizaje: "📚",
};

function ScoreRing({ pct, size = 72, color = "var(--gold)" }: { pct: number; size?: number; color?: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="card flex flex-col gap-1" style={{ padding: "14px 16px" }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <p className="text-lg font-bold" style={{ color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}>
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</p>
      {sub && <p className="text-[10px]" style={{ color: "var(--muted)" }}>{sub}</p>}
    </div>
  );
}

export default function SemanaPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const baseDate = addWeeks(startOfISOWeek(new Date()), weekOffset);
  const weekLabel = `${format(baseDate, "d MMM", { locale: es })} – ${format(addWeeks(baseDate, 1), "d MMM yyyy", { locale: es })}`;
  const isSunday = new Date().getDay() === 0;
  const isCurrentWeek = weekOffset === 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const weekParam = format(baseDate, "yyyy-MM-dd");
    const res = await fetch(`/api/weekly-review?week=${weekParam}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setNote(d.note ?? "");
    }
    setLoading(false);
  }, [weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveNote = async () => {
    if (!data) return;
    setSavingNote(true);
    await fetch("/api/weekly-review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart: data.weekStart, note }),
    });
    setSavingNote(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const habitsColor = data
    ? data.habits.rate >= 80 ? "#4CAF7D" : data.habits.rate >= 50 ? "var(--gold)" : "var(--error)"
    : "var(--gold)";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Semana en Revisión</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{weekLabel}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setWeekOffset(v => v - 1)}
            className="p-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            ‹
          </button>
          <button onClick={() => setWeekOffset(v => v + 1)} disabled={weekOffset >= 0}
            className="p-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-30"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            ›
          </button>
        </div>
      </div>

      {/* Sunday nudge */}
      {isSunday && isCurrentWeek && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <span style={{ fontSize: 22 }}>📋</span>
          <p className="text-sm font-medium" style={{ color: "var(--gold)" }}>
            Es domingo — momento de reflexionar sobre tu semana.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
        </div>
      ) : data ? (
        <>
          {/* Habit ring + score */}
          <div className="card flex items-center gap-5">
            <div style={{ position: "relative", flexShrink: 0 }}>
              <ScoreRing pct={data.habits.rate} color={habitsColor} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="text-lg font-bold" style={{ color: habitsColor, fontFamily: "'Playfair Display', serif" }}>
                  {data.habits.rate}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>Hábitos completados</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                {data.habits.completed} de {data.habits.total} posibles esta semana
              </p>
              {data.habits.rate >= 80 && (
                <span className="text-xs mt-1 inline-block" style={{ color: "#4CAF7D" }}>¡Semana excelente! 🔥</span>
              )}
              {data.habits.rate >= 50 && data.habits.rate < 80 && (
                <span className="text-xs mt-1 inline-block" style={{ color: "var(--gold)" }}>Buen esfuerzo, sigue adelante</span>
              )}
              {data.habits.rate < 50 && data.habits.total > 0 && (
                <span className="text-xs mt-1 inline-block" style={{ color: "var(--muted)" }}>Hay espacio para mejorar esta semana</span>
              )}
            </div>
          </div>

          {/* Habit breakdown */}
          {data.habits.breakdown.length > 0 && (
            <div className="card" style={{ padding: "14px 16px" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>DETALLE DE HÁBITOS</p>
              <div className="space-y-2">
                {data.habits.breakdown.map(h => (
                  <div key={h.id} className="flex items-center gap-3">
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icon}</span>
                    <span className="text-sm flex-1 truncate" style={{ color: "var(--foreground)" }}>{h.name}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {[0,1,2,3,4,5,6].map(i => (
                        <div key={i} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: i < h.daysCompleted ? "#4CAF7D" : "var(--border)",
                        }} />
                      ))}
                    </div>
                    <span className="text-xs w-6 text-right flex-shrink-0" style={{ color: "var(--muted)" }}>
                      {h.daysCompleted}/7
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="🏃"
              label="km corridos"
              value={`${data.running.km} km`}
              sub={data.running.sessions > 0 ? `${data.running.sessions} salida${data.running.sessions !== 1 ? "s" : ""}` : "Sin carreras esta semana"}
            />
            <StatCard
              icon="🌙"
              label="promedio de sueño"
              value={data.sleep.avgHours !== null ? `${data.sleep.avgHours}h` : "—"}
              sub={data.sleep.nights > 0 ? `${data.sleep.nights} noches registradas` : "Sin registros"}
            />
            <StatCard
              icon="💧"
              label="días con agua completa"
              value={`${data.water.fullDays} / 7`}
              sub="≥ 10 vasos"
            />
            <StatCard
              icon="🎯"
              label="metas activas"
              value={`${data.goals.length}`}
              sub={data.goals.filter(g => g.pct >= 100).length > 0
                ? `${data.goals.filter(g => g.pct >= 100).length} completada${data.goals.filter(g => g.pct >= 100).length !== 1 ? "s" : ""} ✓`
                : undefined}
            />
          </div>

          {/* Goals progress */}
          {data.goals.length > 0 && (
            <div className="card" style={{ padding: "14px 16px" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--muted)" }}>PROGRESO DE METAS</p>
              <div className="space-y-3">
                {data.goals.map(g => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span style={{ fontSize: 14 }}>{AREA_ICONS[g.area] ?? "🎯"}</span>
                        <span className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{g.name}</span>
                      </div>
                      <span className="text-xs font-bold flex-shrink-0 ml-2"
                        style={{ color: g.pct >= 100 ? "#4CAF7D" : "var(--gold)" }}>
                        {g.pct}%
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${g.pct}%`,
                        background: g.pct >= 100
                          ? "linear-gradient(90deg, #2E7D4F, #4CAF7D)"
                          : "linear-gradient(90deg, var(--gold-dark), var(--gold))",
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                      {g.currentValue} / {g.targetValue} {g.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reflection */}
          <div className="card" style={{ padding: "14px 16px" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>REFLEXIÓN DE LA SEMANA</p>
            <p className="text-[11px] mb-3" style={{ color: "var(--muted)" }}>
              ¿Qué salió bien? ¿Qué mejorarías? ¿Cómo te sentiste?
            </p>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); setNoteSaved(false); }}
              placeholder="Escribe tu reflexión aquí..."
              rows={5}
              style={{
                width: "100%",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "var(--foreground)",
                fontSize: 14,
                resize: "none",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: noteSaved ? "rgba(76,175,125,0.15)" : "rgba(201,168,76,0.12)",
                border: `1px solid ${noteSaved ? "rgba(76,175,125,0.4)" : "rgba(201,168,76,0.3)"}`,
                color: noteSaved ? "#4CAF7D" : "var(--gold)",
              }}
            >
              {savingNote ? "Guardando..." : noteSaved ? "✓ Guardado" : "Guardar reflexión"}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12" style={{ color: "var(--muted)" }}>
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm">No se pudo cargar el resumen</p>
        </div>
      )}
    </div>
  );
}
