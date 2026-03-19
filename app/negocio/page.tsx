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

interface BusinessProfile {
  nombre: string;
  producto: string;
  metaMensual: number;
}

const PROFILE_KEY = "negocio_profile";
const TASKS_KEY = "negocio_tasks_";

const RECOMMENDATION_CATEGORIES = [
  {
    id: "redes",
    category: "📱 Redes Sociales",
    color: "#5C9BE0",
    items: [
      "Publica contenido mostrando tu producto hoy",
      "Responde todos los mensajes directos pendientes",
      "Graba un video corto mostrando lo que vendes",
      "Comparte un testimonio o reseña de un cliente",
      "Usa hashtags relevantes en tu próxima publicación",
    ],
  },
  {
    id: "clientes",
    category: "🤝 Clientes",
    color: "#4CAF7D",
    items: [
      "Contacta a un cliente anterior para hacer seguimiento",
      "Pide una recomendación a alguien que ya te compró",
      "Ofrece un descuento o detalle a tu cliente más leal",
      "Escríbele a 3 personas nuevas para presentar tu producto",
    ],
  },
  {
    id: "ventas",
    category: "💰 Ventas del Día",
    color: "#C9A84C",
    items: [
      "Publica una oferta o promoción especial hoy",
      "Crea un paquete o combo para aumentar el ticket promedio",
      "Revisa y actualiza tus precios si es necesario",
      "Cierra al menos una venta pendiente de seguimiento",
    ],
  },
  {
    id: "producto",
    category: "📦 Producto / Inventario",
    color: "#E0945C",
    items: [
      "Revisa tu inventario y anota qué necesitas reponer",
      "Toma fotos nuevas y de calidad de tu producto",
      "Investiga qué está ofreciendo tu competencia",
      "Piensa en una nueva variante o producto complementario",
    ],
  },
  {
    id: "finanzas",
    category: "📊 Administración",
    color: "#9B59B6",
    items: [
      "Registra todas tus ventas y gastos de hoy",
      "Calcula cuánto te falta para tu meta mensual",
      "Separa una parte de tus ganancias para reinvertir",
      "Revisa cuánto gastaste esta semana vs lo que ingresaste",
    ],
  },
];

function getTodayTaskKey() {
  return TASKS_KEY + todayISO();
}

export default function NegocioPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [setupForm, setSetupForm] = useState({ nombre: "", producto: "", metaMensual: "" });
  const [setupStep, setSetupStep] = useState(0); // 0=loading, 1=setup, 2=dashboard
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    date: todayISO(), ventas: "", pedidos: "",
    igFollowers: "", tiktokFollowers: "", waContacts: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      setProfile(JSON.parse(saved));
      setSetupStep(2);
    } else {
      setSetupStep(1);
    }
    const savedTasks = localStorage.getItem(getTodayTaskKey());
    if (savedTasks) setCheckedTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    if (setupStep === 2) fetchMetrics();
  }, [setupStep]);

  const saveProfile = () => {
    if (!setupForm.nombre.trim() || !setupForm.producto.trim() || !setupForm.metaMensual) return;
    const p: BusinessProfile = {
      nombre: setupForm.nombre.trim(),
      producto: setupForm.producto.trim(),
      metaMensual: parseFloat(setupForm.metaMensual) || 10000,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    setSetupStep(2);
  };

  const updateProfile = () => {
    if (!setupForm.nombre.trim() || !setupForm.producto.trim() || !setupForm.metaMensual) return;
    const p: BusinessProfile = {
      nombre: setupForm.nombre.trim(),
      producto: setupForm.producto.trim(),
      metaMensual: parseFloat(setupForm.metaMensual) || 10000,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    setShowEditProfile(false);
  };

  const fetchMetrics = async () => {
    const res = await fetch("/api/negocio");
    setMetrics(await res.json());
  };

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

  const toggleTask = (taskId: string) => {
    const updated = { ...checkedTasks, [taskId]: !checkedTasks[taskId] };
    setCheckedTasks(updated);
    localStorage.setItem(getTodayTaskKey(), JSON.stringify(updated));
  };

  const thisMonth = metrics
    .filter(m => {
      const d = new Date(m.date); const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    })
    .reduce((s, m) => s + m.ventas, 0);

  const metaMensual = profile?.metaMensual || 10000;
  const metaPct = Math.min(100, Math.round((thisMonth / metaMensual) * 100));

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const total = metrics.filter(m => { const d = new Date(m.date); return d >= start && d <= end; })
      .reduce((s, m) => s + m.ventas, 0);
    return { name: format(month, "MMM", { locale: es }), ventas: total };
  });

  const latest = metrics[0];
  const tooltip = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" };

  const totalTasks = RECOMMENDATION_CATEGORIES.reduce((s, c) => s + c.items.length, 0);
  const doneTasks = Object.values(checkedTasks).filter(Boolean).length;

  // --- SETUP SCREEN ---
  if (setupStep === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">🏪</div>
            <h1 className="text-2xl font-bold" style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Mi Negocio
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
              Cuéntanos sobre tu negocio para darte recomendaciones personalizadas
            </p>
          </div>

          <Card>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
                  ¿Cómo se llama tu negocio?
                </label>
                <input
                  placeholder="ej. Esencias Lucía, Mi Tienda Online..."
                  value={setupForm.nombre}
                  onChange={e => setSetupForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
                  ¿Qué vendes?
                </label>
                <input
                  placeholder="ej. Perfumes artesanales, ropa, postres, servicios..."
                  value={setupForm.producto}
                  onChange={e => setSetupForm(f => ({ ...f, producto: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "var(--muted)" }}>
                  ¿Cuál es tu meta de ventas mensual? (MXN)
                </label>
                <input
                  type="number"
                  placeholder="ej. 10000"
                  value={setupForm.metaMensual}
                  onChange={e => setSetupForm(f => ({ ...f, metaMensual: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={e => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              <button
                onClick={saveProfile}
                disabled={!setupForm.nombre.trim() || !setupForm.producto.trim() || !setupForm.metaMensual}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
                  color: "#0D0B08",
                  opacity: (!setupForm.nombre.trim() || !setupForm.producto.trim() || !setupForm.metaMensual) ? 0.5 : 1,
                }}
              >
                Comenzar →
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
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
            {profile?.nombre || "Mi Negocio"} 🏪
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{profile?.producto}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSetupForm({ nombre: profile?.nombre || "", producto: profile?.producto || "", metaMensual: String(profile?.metaMensual || "") });
              setShowEditProfile(!showEditProfile);
            }}
            className="text-xs px-3 py-1.5 rounded-xl transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
          >
            ✏️ Editar
          </button>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            {showForm ? "Cancelar" : "+ Registrar"}
          </Button>
        </div>
      </div>

      {/* Edit profile form */}
      {showEditProfile && (
        <Card>
          <CardHeader><CardTitle>Editar negocio</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Nombre del negocio" value={setupForm.nombre} onChange={e => setSetupForm(f => ({ ...f, nombre: e.target.value }))} />
            <Input label="¿Qué vendes?" value={setupForm.producto} onChange={e => setSetupForm(f => ({ ...f, producto: e.target.value }))} />
            <Input label="Meta mensual (MXN)" type="number" value={setupForm.metaMensual} onChange={e => setSetupForm(f => ({ ...f, metaMensual: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={updateProfile} size="sm" className="flex-1">Guardar</Button>
              <Button onClick={() => setShowEditProfile(false)} variant="ghost" size="sm">Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Register metric form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Registrar ventas del día</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Fecha" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ventas (MXN)" type="number" placeholder="0" value={form.ventas} onChange={e => setForm({ ...form, ventas: e.target.value })} />
              <Input label="Pedidos" type="number" placeholder="0" value={form.pedidos} onChange={e => setForm({ ...form, pedidos: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Instagram" type="number" placeholder="seguidores" value={form.igFollowers} onChange={e => setForm({ ...form, igFollowers: e.target.value })} />
              <Input label="TikTok" type="number" placeholder="seguidores" value={form.tiktokFollowers} onChange={e => setForm({ ...form, tiktokFollowers: e.target.value })} />
              <Input label="WhatsApp" type="number" placeholder="contactos" value={form.waContacts} onChange={e => setForm({ ...form, waContacts: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Card>
      )}

      {/* Monthly goal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meta de {format(new Date(), "MMMM", { locale: es })}</CardTitle>
            <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>{metaPct}%</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {formatMXN(thisMonth)} de {formatMXN(metaMensual)} este mes
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${metaPct}%` }} />
          </div>
          {metaPct < 100 && (
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Faltan {formatMXN(metaMensual - thisMonth)} para tu meta
            </p>
          )}
          {metaPct >= 100 && (
            <p className="text-xs mt-2 font-medium" style={{ color: "#4CAF7D" }}>
              🎉 ¡Meta mensual alcanzada!
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Latest KPIs */}
      {latest && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Ventas hoy", value: formatMXN(latest.ventas), icon: "💰" },
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

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
            Plan de Acción de Hoy
          </h2>
          <span className="text-xs px-2 py-1 rounded-full" style={{
            background: doneTasks === totalTasks ? "rgba(76,175,125,0.15)" : "rgba(201,168,76,0.15)",
            color: doneTasks === totalTasks ? "#4CAF7D" : "var(--gold)",
          }}>
            {doneTasks}/{totalTasks} tareas
          </span>
        </div>

        <div className="space-y-3">
          {RECOMMENDATION_CATEGORIES.map(cat => {
            const catDone = cat.items.filter((_, i) => checkedTasks[`${cat.id}_${i}`]).length;
            return (
              <Card key={cat.id}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{cat.category}</p>
                  <span className="text-xs" style={{ color: cat.color }}>
                    {catDone}/{cat.items.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const key = `${cat.id}_${i}`;
                    const done = checkedTasks[key] || false;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleTask(key)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
                        style={{
                          background: done ? `${cat.color}12` : "var(--surface)",
                          border: `1px solid ${done ? cat.color + "30" : "var(--border)"}`,
                        }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: done ? cat.color : "transparent",
                            border: done ? "none" : `2px solid var(--border)`,
                          }}
                        >
                          {done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm" style={{
                          color: done ? "var(--muted)" : "var(--foreground)",
                          textDecoration: done ? "line-through" : "none",
                          opacity: done ? 0.6 : 1,
                        }}>
                          {item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Chart */}
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

      {/* History */}
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
