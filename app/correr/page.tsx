"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { todayISO, paceFromDistanceTime, getRunningZone } from "@/lib/utils";
import { format, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface RunSession {
  id: string;
  date: string;
  distanceKm: number;
  durationMin: number;
  avgHr?: number;
  zone?: string;
  type: string;
  notes?: string;
}

const ZONES = ["Z1", "Z2", "Z3", "Z4", "Z5"];
const SESSION_TYPES = ["Easy", "Tempo", "Interval", "Long Run", "Race", "Recovery"];
const MAX_HR = 205;

const ZONE_COLORS: Record<string, string> = {
  Z1: "#4CAF7D",
  Z2: "#5C9BE0",
  Z3: "#E8C875",
  Z4: "#E0945C",
  Z5: "#E05C5C",
};

export default function CorrerPage() {
  const [sessions, setSessions] = useState<RunSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    distanceKm: "",
    durationMin: "",
    avgHr: "",
    zone: "",
    type: "Easy",
    notes: "",
  });

  const fetchSessions = async () => {
    const res = await fetch("/api/run");
    const data = await res.json();
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSave = async () => {
    if (!form.distanceKm || !form.durationMin) return;
    setSaving(true);

    const avgHr = parseInt(form.avgHr) || undefined;
    const zone = avgHr ? getRunningZone(avgHr, MAX_HR) : form.zone;

    await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        distanceKm: parseFloat(form.distanceKm),
        durationMin: parseFloat(form.durationMin),
        avgHr,
        zone,
      }),
    });
    await fetchSessions();
    setShowForm(false);
    setSaving(false);
    setForm({
      date: todayISO(),
      distanceKm: "",
      durationMin: "",
      avgHr: "",
      zone: "",
      type: "Easy",
      notes: "",
    });
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/run?id=${id}`, { method: "DELETE" });
    fetchSessions();
  };

  // Weekly km chart (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.date);
      return d >= weekStart && d <= weekEnd;
    });
    const km = weekSessions.reduce((s, r) => s + r.distanceKm, 0);
    return {
      name: format(weekStart, "d/M", { locale: es }),
      km: Math.round(km * 10) / 10,
    };
  });

  // Stats
  const totalKm = sessions.reduce((s, r) => s + r.distanceKm, 0);
  const totalSessions = sessions.length;
  const best5K = sessions
    .filter((s) => s.distanceKm >= 4.9 && s.distanceKm <= 5.1)
    .sort((a, b) => a.durationMin - b.durationMin)[0];

  // Sub-20 progress
  const current5KMin = 21.57; // 21:34
  const target5KMin = 20;
  const current5KPct = Math.round(
    ((current5KMin - (best5K?.durationMin || current5KMin)) /
      (current5KMin - target5KMin)) *
      100
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #C9A84C 0%, #E8C875 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Running Log 🏃
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B6355" }}>
            {totalSessions} sesiones · {totalKm.toFixed(1)} km totales
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "Cancelar" : "+ Sesión"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar sesión</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "#A89880" }}>
                  Tipo
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "#242018",
                    border: "1px solid #2E2A22",
                    color: "#F5F0E8",
                  }}
                >
                  {SESSION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Distancia (km)"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
              />
              <Input
                label="Tiempo (min)"
                type="number"
                step="0.1"
                placeholder="25"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
              />
              <Input
                label="FC prom (bpm)"
                type="number"
                placeholder="145"
                value={form.avgHr}
                onChange={(e) => setForm({ ...form, avgHr: e.target.value })}
              />
            </div>
            {form.avgHr && (
              <div
                className="px-3 py-2 rounded-xl text-sm"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  color: "#C9A84C",
                }}
              >
                Zona calculada:{" "}
                <strong>
                  {getRunningZone(parseInt(form.avgHr), MAX_HR)}
                </strong>
                {" "}(FC máx: {MAX_HR} bpm)
              </div>
            )}
            {form.distanceKm && form.durationMin && (
              <div
                className="px-3 py-2 rounded-xl text-sm"
                style={{
                  background: "rgba(92,155,224,0.1)",
                  color: "#5C9BE0",
                }}
              >
                Ritmo:{" "}
                <strong>
                  {paceFromDistanceTime(
                    parseFloat(form.distanceKm),
                    parseFloat(form.durationMin)
                  )}
                </strong>{" "}
                min/km
              </div>
            )}
            <Textarea
              label="Notas"
              placeholder="¿Cómo te sentiste?"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar sesión"}
            </Button>
          </div>
        </Card>
      )}

      {/* Goals */}
      <div className="grid grid-cols-1 gap-3">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium" style={{ color: "#F5F0E8" }}>
                Sub-20 en 5K
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6B6355" }}>
                Meta: julio 2025 · Actual: 21:34
              </p>
            </div>
            <span
              className="text-lg font-bold"
              style={{
                color: "#C9A84C",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {best5K
                ? `${Math.floor(best5K.durationMin)}:${Math.round((best5K.durationMin % 1) * 60)
                    .toString()
                    .padStart(2, "0")}`
                : "21:34"}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, current5KPct))}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle>Km por semana (últimas 8)</CardTitle>
        </CardHeader>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2A22" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B6355", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6355", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1713",
                  border: "1px solid #2E2A22",
                  borderRadius: 8,
                  color: "#F5F0E8",
                }}
                formatter={(v) => [`${v} km`, "Distancia"]}
              />
              <Bar dataKey="km" fill="#C9A84C" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sessions list */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2E2A22" }}
              >
                {/* Zone badge */}
                <span
                  className="text-xs font-bold w-8 text-center py-1 rounded-lg flex-shrink-0"
                  style={{
                    background: s.zone
                      ? `${ZONE_COLORS[s.zone]}22`
                      : "#2E2A22",
                    color: s.zone ? ZONE_COLORS[s.zone] : "#6B6355",
                  }}
                >
                  {s.zone || "—"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "#F5F0E8" }}>
                      {s.distanceKm} km
                    </span>
                    <span className="text-xs" style={{ color: "#6B6355" }}>
                      {paceFromDistanceTime(s.distanceKm, s.durationMin)} min/km
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#6B6355" }}>
                    {new Date(s.date).toLocaleDateString("es-MX", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {s.avgHr ? ` · FC: ${s.avgHr} bpm` : ""}
                    {" · "}{s.type}
                  </div>
                </div>
                <button
                  onClick={() => deleteSession(s.id)}
                  className="text-xs px-2 py-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: "#E05C5C" }}
                >
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
