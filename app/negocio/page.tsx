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
import { Input } from "@/components/ui/Input";
import { formatMXN, todayISO } from "@/lib/utils";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface Metric {
  id: string;
  date: string;
  ventas: number;
  pedidos: number;
  igFollowers: number;
  tiktokFollowers: number;
  waContacts: number;
}

const META_VENTAS = 10000;

export default function NegocioPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    ventas: "",
    pedidos: "",
    igFollowers: "",
    tiktokFollowers: "",
    waContacts: "",
  });

  const fetchMetrics = async () => {
    const res = await fetch("/api/negocio");
    const data = await res.json();
    setMetrics(data);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

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

  // Chart data: last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const monthMetrics = metrics.filter((m) => {
      const d = new Date(m.date);
      return d >= start && d <= end;
    });
    const totalVentas = monthMetrics.reduce((s, m) => s + m.ventas, 0);
    return {
      name: format(month, "MMM", { locale: es }),
      ventas: totalVentas,
    };
  });

  // Latest metric
  const latest = metrics[0];

  // Total ventas current month
  const thisMonth = metrics
    .filter((m) => {
      const d = new Date(m.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, m) => s + m.ventas, 0);

  const metaPct = Math.min(100, Math.round((thisMonth / META_VENTAS) * 100));

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
            Secreto Perfumista 💎
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B6355" }}>
            Métricas del negocio
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? "Cancelar" : "+ Registrar"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Entrada del día</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Input
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ventas (MXN)"
                type="number"
                placeholder="0"
                value={form.ventas}
                onChange={(e) => setForm({ ...form, ventas: e.target.value })}
              />
              <Input
                label="Pedidos"
                type="number"
                placeholder="0"
                value={form.pedidos}
                onChange={(e) => setForm({ ...form, pedidos: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="IG"
                type="number"
                placeholder="0"
                value={form.igFollowers}
                onChange={(e) => setForm({ ...form, igFollowers: e.target.value })}
              />
              <Input
                label="TikTok"
                type="number"
                placeholder="0"
                value={form.tiktokFollowers}
                onChange={(e) =>
                  setForm({ ...form, tiktokFollowers: e.target.value })
                }
              />
              <Input
                label="WhatsApp"
                type="number"
                placeholder="0"
                value={form.waContacts}
                onChange={(e) => setForm({ ...form, waContacts: e.target.value })}
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Card>
      )}

      {/* Meta anual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meta diciembre 2025</CardTitle>
            <span
              className="text-sm font-bold"
              style={{ color: "#C9A84C" }}
            >
              {metaPct}%
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#6B6355" }}>
            {formatMXN(thisMonth)} de {formatMXN(META_VENTAS)} este mes
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${metaPct}%` }} />
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      {latest && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Ventas", value: formatMXN(latest.ventas), icon: "💰" },
            { label: "Pedidos", value: latest.pedidos, icon: "📦" },
            { label: "Instagram", value: `${latest.igFollowers.toLocaleString()}`, icon: "📸" },
            { label: "TikTok", value: `${latest.tiktokFollowers.toLocaleString()}`, icon: "🎵" },
          ].map((kpi) => (
            <div key={kpi.label} className="card">
              <div className="flex items-center gap-2 mb-1">
                <span>{kpi.icon}</span>
                <span className="text-xs" style={{ color: "#6B6355" }}>
                  {kpi.label}
                </span>
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color: "#F5F0E8",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sales chart */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas últimos 6 meses</CardTitle>
        </CardHeader>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2A22" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#6B6355", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B6355", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1A1713",
                  border: "1px solid #2E2A22",
                  borderRadius: 8,
                  color: "#F5F0E8",
                }}
                formatter={(v) => [formatMXN(Number(v)), "Ventas"]}
              />
              <Bar
                dataKey="ventas"
                fill="#C9A84C"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent entries */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas entradas</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {metrics.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "#2E2A22" }}
              >
                <span className="text-sm" style={{ color: "#6B6355" }}>
                  {new Date(m.date).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <div className="flex gap-4">
                  <span className="text-sm font-medium" style={{ color: "#C9A84C" }}>
                    {formatMXN(m.ventas)}
                  </span>
                  <span className="text-sm" style={{ color: "#6B6355" }}>
                    {m.pedidos} pedidos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
