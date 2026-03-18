"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { todayISO } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface SleepLog {
  id: string; date: string; bedtime: string; wakeTime: string;
  hours: number; quality: number; bodyBattery?: number; stressScore?: number; notes?: string;
}

const QUALITY_LABELS = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
const QUALITY_COLORS = ["", "#E05C5C", "#E0945C", "#E8C875", "#4CAF7D", "#5C9BE0"];

export default function SuenoPage() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(), bedtime: "22:30", wakeTime: "06:30",
    quality: "4", bodyBattery: "", stressScore: "", notes: "",
  });

  const fetchLogs = async () => { setLogs(await (await fetch("/api/sleep")).json()); };
  useEffect(() => { fetchLogs(); }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, quality: parseInt(form.quality),
        bodyBattery: form.bodyBattery ? parseInt(form.bodyBattery) : undefined,
        stressScore: form.stressScore ? parseInt(form.stressScore) : undefined,
      }),
    });
    await fetchLogs(); setShowForm(false); setSaving(false);
  };

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const ds = date.toISOString().split("T")[0];
    const log = logs.find(l => new Date(l.date).toISOString().split("T")[0] === ds);
    return { name: format(date, "EEE", { locale: es }), hours: log?.hours || 0, quality: log?.quality || 0 };
  });

  const recent = logs.slice(0, 7);
  const avgHours = recent.length > 0 ? Math.round(recent.reduce((s, l) => s + l.hours, 0) / recent.length * 10) / 10 : 0;
  const avgQuality = recent.length > 0 ? Math.round(recent.reduce((s, l) => s + l.quality, 0) / recent.length * 10) / 10 : 0;
  const bbLogs = recent.filter(l => l.bodyBattery);
  const avgBB = bbLogs.length > 0 ? Math.round(bbLogs.reduce((s, l) => s + (l.bodyBattery || 0), 0) / bbLogs.length) : null;

  const tooltip = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Sueño 🌙</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Promedio: {avgHours}h · Calidad: {avgQuality}/5</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">{showForm ? "Cancelar" : "+ Registrar"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Registro de sueño</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Fecha" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Hora de dormir" type="time" value={form.bedtime} onChange={e => setForm({ ...form, bedtime: e.target.value })} />
              <Input label="Hora de despertar" type="time" value={form.wakeTime} onChange={e => setForm({ ...form, wakeTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: "var(--muted-2, var(--muted))" }}>Calidad del sueño</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(q => (
                  <button key={q} onClick={() => setForm({ ...form, quality: q.toString() })}
                    className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: form.quality === q.toString() ? QUALITY_COLORS[q] : "var(--surface)",
                      border: `1px solid ${form.quality === q.toString() ? QUALITY_COLORS[q] : "var(--border)"}`,
                      color: form.quality === q.toString() ? "var(--background)" : "var(--muted)",
                    }}>
                    {q}
                  </button>
                ))}
              </div>
              <p className="text-xs text-center" style={{ color: "var(--muted)" }}>{QUALITY_LABELS[parseInt(form.quality)]}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Body Battery Garmin" type="number" min="0" max="100" placeholder="75" value={form.bodyBattery} onChange={e => setForm({ ...form, bodyBattery: e.target.value })} />
              <Input label="Stress Score" type="number" min="0" max="100" placeholder="25" value={form.stressScore} onChange={e => setForm({ ...form, stressScore: e.target.value })} />
            </div>
            <Textarea label="Notas" placeholder="¿Soñaste algo? ¿Despertaste?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar"}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { value: `${avgHours}h`, label: "promedio" },
          { value: `${avgQuality}/5`, label: "calidad" },
          { value: avgBB ?? "—", label: "body battery" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Últimos 7 días</CardTitle></CardHeader>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip contentStyle={tooltip} formatter={v => [`${v}h`, "Sueño"]} />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={QUALITY_COLORS[entry.quality] || "var(--border)"} fillOpacity={entry.hours > 0 ? 0.9 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3 flex-wrap justify-center mt-2">
          {[1, 2, 3, 4, 5].map(q => (
            <div key={q} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: QUALITY_COLORS[q] }} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>{QUALITY_LABELS[q]}</span>
            </div>
          ))}
        </div>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Registros recientes</CardTitle></CardHeader>
          <div className="space-y-2">
            {logs.slice(0, 7).map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: QUALITY_COLORS[log.quality] }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{log.hours}h · {QUALITY_LABELS[log.quality]}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(log.date).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {log.bedtime} → {log.wakeTime}
                    {log.bodyBattery ? ` · BB: ${log.bodyBattery}` : ""}
                    {log.stressScore ? ` · Stress: ${log.stressScore}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
