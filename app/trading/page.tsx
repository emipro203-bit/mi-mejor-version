"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface TradingModule {
  id: string;
  number: number;
  name: string;
  done: boolean;
}

interface TradingNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function TradingPage() {
  const [modules, setModules] = useState<TradingModule[]>([]);
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });

  const fetchData = async () => {
    const res = await fetch("/api/trading");
    const data = await res.json();
    setModules(data.modules || []);
    setNotes(data.notes || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModule = async (id: string, done: boolean) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !done } : m))
    );
    await fetch("/api/trading", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: !done }),
    });
  };

  const saveNote = async () => {
    if (!noteForm.title || !noteForm.content) return;
    setSaving(true);
    await fetch("/api/trading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noteForm),
    });
    await fetchData();
    setShowNoteForm(false);
    setNoteForm({ title: "", content: "" });
    setSaving(false);
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/trading?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const completedModules = modules.filter((m) => m.done).length;
  const progress =
    modules.length > 0
      ? Math.round((completedModules / modules.length) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
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
          Trading 📈
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B6355" }}>
          Programa de aprendizaje Forex
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progreso del programa</CardTitle>
            <span
              className="text-xl font-bold"
              style={{
                color: "#C9A84C",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {progress}%
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#6B6355" }}>
            {completedModules} de {modules.length} módulos completados
          </p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </CardHeader>
      </Card>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => toggleModule(mod.id, mod.done)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
              style={{
                background: mod.done
                  ? "rgba(201, 168, 76, 0.08)"
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${mod.done ? "rgba(201,168,76,0.25)" : "#2E2A22"}`,
              }}
            >
              {/* Checkbox */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: mod.done
                    ? "linear-gradient(135deg, #9A7A35, #C9A84C)"
                    : "transparent",
                  border: mod.done ? "none" : "2px solid #2E2A22",
                }}
              >
                {mod.done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <span
                className="text-sm flex-1"
                style={{
                  color: mod.done ? "#C9A84C" : "#F5F0E8",
                  opacity: mod.done ? 0.7 : 1,
                }}
              >
                <span style={{ color: "#6B6355" }}>M{mod.number}.</span> {mod.name}
              </span>

              {mod.done && (
                <span className="text-xs" style={{ color: "#4CAF7D" }}>
                  ✓ Completado
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Notes */}
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", color: "#F5F0E8" }}
        >
          Notas de aprendizaje
        </h2>
        <Button onClick={() => setShowNoteForm(!showNoteForm)} size="sm">
          {showNoteForm ? "Cancelar" : "+ Nota"}
        </Button>
      </div>

      {showNoteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva nota</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Input
              label="Título"
              placeholder="ej. Patrones de velas japonesas"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
            />
            <Textarea
              label="Contenido"
              placeholder="Escribe lo que aprendiste..."
              value={noteForm.content}
              onChange={(e) =>
                setNoteForm({ ...noteForm, content: e.target.value })
              }
              rows={4}
            />
            <Button onClick={saveNote} disabled={saving} className="w-full">
              {saving ? "Guardando..." : "Guardar nota"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm"
                  style={{ color: "#F5F0E8" }}
                >
                  {note.title}
                </h3>
                <p className="text-xs mt-0.5 mb-2" style={{ color: "#6B6355" }}>
                  {new Date(note.createdAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#A89880" }}>
                  {note.content}
                </p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="opacity-40 hover:opacity-100 transition-opacity text-xs p-1"
                style={{ color: "#E05C5C" }}
              >
                ✕
              </button>
            </div>
          </Card>
        ))}

        {notes.length === 0 && (
          <div
            className="text-center py-8"
            style={{ color: "#6B6355" }}
          >
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">Aún no tienes notas</p>
          </div>
        )}
      </div>
    </div>
  );
}
