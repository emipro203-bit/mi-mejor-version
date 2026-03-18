"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { todayISO, paceFromDistanceTime, getRunningZone } from "@/lib/utils";
import { format, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface RunSession {
  id: string; date: string; distanceKm: number; durationMin: number;
  avgHr?: number; zone?: string; type: string; notes?: string;
}

const ZONES = ["Z1", "Z2", "Z3", "Z4", "Z5"];
const SESSION_TYPES = ["Easy", "Tempo", "Interval", "Long Run", "Race", "Recovery"];
const MAX_HR = 205;
const ZONE_COLORS: Record<string, string> = {
  Z1: "#4CAF7D", Z2: "#5C9BE0", Z3: "#E8C875", Z4: "#E0945C", Z5: "#E05C5C",
};

export default function CorrerPage() {
  const [sessions, setSessions] = useState<RunSession[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(), distanceKm: "", durationMin: "",
    avgHr: "", zone: "", type: "Easy", notes: "",
  });

  const fetchSessions = async () => { setSessions(await (await fetch("/api/run")).json()); };
  useEffect(() => { fetchSessions(); }, []);

  const handleSave = async () => {
    if (!form.distanceKm || !form.durationMin) return;
    setSaving(true);
    const avgHr = parseInt(form.avgHr) || undefined;
    const zone = avgHr ? getRunningZone(avgHr, MAX_HR) : form.zone;
    await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, distanceKm: parseFloat(form.distanceKm), durationMin: parseFloat(form.durationMin), avgHr, zone }),
    });
    await fetchSessions();
    setShowForm(false); setSaving(false);
    setForm({ date: todayISO(), distanceKm: "", durationMin: "", avgHr: "", zone: "", type: "Easy", notes: "" });
  };

  const deleteSession = async (id: string) => { await fetch(`/api/run?id=${id}`, { method: "DELETE" }); fetchSessions(); };

  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const wStart = startOfWeek(subWeeks(new Date(), 7 - i), { weekStartsOn: 1 });
    const wEnd = endOfWeek(wStart, { weekStartsOn: 1 });
    const km = sessions.filter(s => { const d = new Date(s.date); return d >= wStart && d <= wEnd; }).reduce((s, r) => s + r.distanceKm, 0);
    return { name: format(wStart, "d/M", { locale: es }), km: Math.round(km * 10) / 10 };
  });

  const totalKm = sessions.reduce((s, r) => s + r.distanceKm, 0);
  const best5K = sessions.filter(s => s.distanceKm >= 4.9 && s.distanceKm <= 5.1).sort((a, b) => a.durationMin - b.durationMin)[0];
  const current5KPct = Math.round(((21.57 - (best5K?.durationMin || 21.57)) / (21.57 - 20)) * 100);

  const tooltip = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Running Log 🏃</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{sessions.length} sesiones · {totalKm.toFixed(1)} km totales</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">{showForm ? "Cancelar" : "+ Sesión"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Registrar sesión</CardTitle></CardHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Fecha" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "var(--muted-2, var(--muted))" }}>Tipo</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-2, var(--surface))", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Distancia (km)" type="number" step="0.1" placeholder="5.0" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: e.target.value })} />
              <Input label="Tiempo (min)" type="number" step="0.1" placeholder="25" value={form.durationMin} onChange={e => setForm({ ...form, durationMin: e.target.value })} />
              <Input label="FC prom (bpm)" type="number" placeholder="145" value={form.avgHr} onChange={e => setForm({ ...form, avgHr: e.target.value })} />
            </div>
            {form.avgHr && (
              <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>
                Zona calculada: <strong>{getRunningZone(parseInt(form.avgHr), MAX_HR)}</strong> (FC máx: {MAX_HR} bpm)
              </div>
            )}
            {form.distanceKm && form.durationMin && (
              <div className="px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(92,155,224,0.1)", color: "var(--info)" }}>
                Ritmo: <strong>{paceFromDistanceTime(parseFloat(form.distanceKm), parseFloat(form.durationMin))}</strong> min/km
              </div>
            )}
            <Textarea label="Notas" placeholder="¿Cómo te sentiste?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar sesión"}</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sub-20 en 5K</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Meta: julio 2025 · Actual: 21:34</p>
          </div>
          <span className="text-lg font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
            {best5K ? `${Math.floor(best5K.durationMin)}:${Math.round((best5K.durationMin % 1) * 60).toString().padStart(2, "0")}` : "21:34"}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${Math.max(0, Math.min(100, current5KPct))}%` }} />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Km por semana (últimas 8)</CardTitle></CardHeader>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltip} formatter={v => [`${v} km`, "Distancia"]} />
              <Bar dataKey="km" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {sessions.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historial</CardTitle></CardHeader>
          <div className="space-y-2">
            {sessions.slice(0, 10).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-bold w-8 text-center py-1 rounded-lg flex-shrink-0"
                  style={{ background: s.zone ? `${ZONE_COLORS[s.zone]}22` : "var(--border)", color: s.zone ? ZONE_COLORS[s.zone] : "var(--muted)" }}>
                  {s.zone || "—"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.distanceKm} km</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{paceFromDistanceTime(s.distanceKm, s.durationMin)} min/km</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {new Date(s.date).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                    {s.avgHr ? ` · FC: ${s.avgHr} bpm` : ""} · {s.type}
                  </div>
                </div>
                <button onClick={() => deleteSession(s.id)} className="text-xs px-2 py-1 rounded-lg opacity-40 hover:opacity-100 transition-opacity" style={{ color: "var(--error)" }}>✕</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
