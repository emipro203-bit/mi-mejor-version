"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { percentOf } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Goal {
  id: string; name: string; area: string;
  currentValue: number; targetValue: number;
  unit: string; deadline: string; notes?: string;
}

const AREAS = ["Running", "Negocio", "Salud", "Personal", "Finanzas", "Aprendizaje"];
const AREA_ICONS: Record<string, string> = {
  Running: "🏃", Negocio: "💎", Salud: "❤️",
  Personal: "🌟", Finanzas: "💰", Aprendizaje: "📚",
};
const EMPTY_FORM = { name: "", area: "Personal", currentValue: "", targetValue: "", unit: "", deadline: "", notes: "" };

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterArea, setFilterArea] = useState("Todas");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchGoals = async () => { setGoals(await (await fetch("/api/goals")).json()); };
  useEffect(() => { fetchGoals(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.targetValue || !form.deadline) return;
    setSaving(true);
    await fetch("/api/goals", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editId ? { id: editId } : {}),
        name: form.name, area: form.area,
        currentValue: parseFloat(form.currentValue) || 0,
        targetValue: parseFloat(form.targetValue),
        unit: form.unit, deadline: form.deadline, notes: form.notes,
      }),
    });
    await fetchGoals();
    setShowForm(false); setEditId(null); setForm(EMPTY_FORM); setSaving(false);
  };

  const handleEdit = (g: Goal) => {
    setEditId(g.id);
    setForm({ name: g.name, area: g.area, currentValue: g.currentValue.toString(), targetValue: g.targetValue.toString(), unit: g.unit, deadline: new Date(g.deadline).toISOString().split("T")[0], notes: g.notes || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => { await fetch(`/api/goals?id=${id}`, { method: "DELETE" }); fetchGoals(); };

  const filtered = filterArea === "Todas" ? goals : goals.filter(g => g.area === filterArea);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>Metas 🎯</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {goals.length} meta{goals.length !== 1 ? "s" : ""} activa{goals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(!showForm); }} size="sm">
          {showForm ? "Cancelar" : "+ Meta"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editId ? "Editar meta" : "Nueva meta"}</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Nombre de la meta" placeholder="ej. Sub-20 en 5K" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: "var(--muted-2, var(--muted))" }}>Área</label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map(area => (
                  <button key={area} onClick={() => setForm({ ...form, area })}
                    className="px-3 py-1.5 rounded-xl text-sm transition-all"
                    style={{
                      background: form.area === area ? "rgba(201,168,76,0.15)" : "var(--surface)",
                      border: `1px solid ${form.area === area ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
                      color: form.area === area ? "var(--gold)" : "var(--muted)",
                    }}>
                    {AREA_ICONS[area]} {area}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Valor actual" type="number" step="any" placeholder="0" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
              <Input label="Valor objetivo" type="number" step="any" placeholder="100" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} />
              <Input label="Unidad" placeholder="km, MXN..." value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <Input label="Fecha límite" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            <Textarea label="Notas (opcional)" placeholder="Contexto, estrategia..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Guardando..." : editId ? "Actualizar" : "Crear meta"}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["Todas", ...AREAS].map(area => (
          <button key={area} onClick={() => setFilterArea(area)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: filterArea === area ? "rgba(201,168,76,0.15)" : "var(--surface)",
              border: `1px solid ${filterArea === area ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
              color: filterArea === area ? "var(--gold)" : "var(--muted)",
            }}>
            {area !== "Todas" ? `${AREA_ICONS[area]} ` : ""}{area}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(goal => {
          const pct = percentOf(goal.currentValue, goal.targetValue);
          const deadline = new Date(goal.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return (
            <Card key={goal.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{AREA_ICONS[goal.area] || "🎯"}</span>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{goal.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {goal.area} · {format(deadline, "d MMM yyyy", { locale: es })}
                      {daysLeft > 0 ? ` · ${daysLeft} días` : " · ¡Fecha pasada!"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(goal)} className="p-1.5 rounded-lg transition-opacity hover:opacity-100 opacity-50" style={{ color: "var(--gold)" }}>✏️</button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg transition-opacity hover:opacity-100 opacity-50" style={{ color: "var(--error)" }}>🗑️</button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                  <span className="text-sm font-bold" style={{ color: pct >= 100 ? "#4CAF7D" : "var(--gold)" }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: pct >= 100 ? "linear-gradient(90deg, #2E7D4F, #4CAF7D)" : undefined }} />
                </div>
              </div>
              {goal.notes && <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>{goal.notes}</p>}
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm">Sin metas en esta área</p>
          </div>
        )}
      </div>
    </div>
  );
}
