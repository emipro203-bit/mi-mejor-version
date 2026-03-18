"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatMXN, todayISO } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface Metric {
  id: string; date: string; ventas: number; pedidos: number;
  igFollowers: number; tiktokFollowers: number; waContacts: number;
}

const META_VENTAS = 10000;

export default function NegocioPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(), ventas: "", pedidos: "",
    igFollowers: "", tiktokFollowers: "", waContacts: "",
  });

  const fetchMetrics = async () => {
    const res = await fetch("/api/negocio");
    setMetrics(await res.json());
  };

  useEffect(() => { fetchMetrics(); }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/negocio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        ventas: parseFloat(form.ventas) || 0,
        pedidos: parseInt(form.pedidos) || 0,
        igFollowers: parseInt(form.igFollowers) || 0,
        tiktokFollowers: parseInt(form.tiktokFollowers) || 0,
        waContacts: parseInt(form.waContacts) || 0,
      }),
    });
    await fetchMetrics();
    setShowForm(false);
    setSaving(false);
  };

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const total = metrics.filter(m => { const d = new Date(m.date); return d >= start && d <= end; })
      .reduce((s, m) => s + m.ventas, 0);
    return { name: format(month, "MMM", { locale: es }), ventas: total };
  });

  const latest = metrics[0];
  const thisMonth = metrics
    .filter(m => { const d = new Date(m.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); })
    .reduce((s, m) => s + m.ventas, 0);
  const metaPct = Math.min(100, Math.round((thisMonth / META_VENTAS) * 100));

  const tooltip = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Secreto Perfumista 💎</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Métricas del negocio</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "Cancelar" : "+ Registrar"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Entrada del día</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Fecha" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ventas (MXN)" type="number" placeholder="0" value={form.ventas} onChange={e => setForm({ ...form, ventas: e.target.value })} />
              <Input label="Pedidos" type="number" placeholder="0" value={form.pedidos} onChange={e => setForm({ ...form, pedidos: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="IG" type="number" placeholder="0" value={form.igFollowers} onChange={e => setForm({ ...form, igFollowers: e.target.value })} />
              <Input label="TikTok" type="number" placeholder="0" value={form.tiktokFollowers} onChange={e => setForm({ ...form, tiktokFollowers: e.target.value })} />
              <Input label="WhatsApp" type="number" placeholder="0" value={form.waContacts} onChange={e => setForm({ ...form, waContacts: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meta diciembre 2025</CardTitle>
            <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>{metaPct}%</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {formatMXN(thisMonth)} de {formatMXN(META_VENTAS)} este mes
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${metaPct}%` }} />
          </div>
        </CardHeader>
      </Card>

      {latest && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Ventas", value: formatMXN(latest.ventas), icon: "💰" },
            { label: "Pedidos", value: latest.pedidos, icon: "📦" },
            { label: "Instagram", value: latest.igFollowers.toLocaleString(), icon: "📸" },
            { label: "TikTok", value: latest.tiktokFollowers.toLocaleString(), icon: "🎵" },
          ].map(kpi => (
            <div key={kpi.label} className="card">
              <div className="flex items-center gap-2 mb-1">
                <span>{kpi.icon}</span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{kpi.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Ventas últimos 6 meses</CardTitle></CardHeader>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltip} formatter={v => [formatMXN(Number(v)), "Ventas"]} />
              <Bar dataKey="ventas" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {metrics.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Últimas entradas</CardTitle></CardHeader>
          <div className="space-y-2">
            {metrics.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-sm" style={{ color: "var(--muted)" }}>
                  {new Date(m.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
                <div className="flex gap-4">
                  <span className="text-sm font-medium" style={{ color: "var(--gold)" }}>{formatMXN(m.ventas)}</span>
                  <span className="text-sm" style={{ color: "var(--muted)" }}>{m.pedidos} pedidos</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
