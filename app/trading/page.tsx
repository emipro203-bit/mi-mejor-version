"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { MODULE_CONTENT } from "@/lib/trading-resources";

interface TradingModule { id: string; number: number; name: string; done: boolean; }
interface TradingNote { id: string; title: string; content: string; createdAt: string; }

export default function TradingPage() {
  const router = useRouter();
  const [modules, setModules] = useState<TradingModule[]>([]);
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });

  const fetchData = async () => {
    const data = await (await fetch("/api/trading")).json();
    setModules(data.modules || []); setNotes(data.notes || []);
  };
  useEffect(() => { fetchData(); }, []);

  const toggleModule = async (id: string, done: boolean) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, done: !done } : m));
    await fetch("/api/trading", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, done: !done }) });
  };

  const saveNote = async () => {
    if (!noteForm.title || !noteForm.content) return;
    setSaving(true);
    await fetch("/api/trading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(noteForm) });
    await fetchData(); setShowNoteForm(false); setNoteForm({ title: "", content: "" }); setSaving(false);
  };

  const deleteNote = async (id: string) => { await fetch(`/api/trading?id=${id}`, { method: "DELETE" }); fetchData(); };

  const completedModules = modules.filter(m => m.done).length;
  const progress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Trading 📈</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Programa de aprendizaje Forex</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progreso del programa</CardTitle>
            <span className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>{progress}%</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{completedModules} de {modules.length} módulos completados</p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Módulos</CardTitle></CardHeader>
        <div className="space-y-2">
          {modules.map(mod => {
            const content = MODULE_CONTENT[mod.number];
            return (
              <div key={mod.id} className="rounded-xl overflow-hidden"
                style={{ background: mod.done ? "rgba(201,168,76,0.06)" : "var(--surface)", border: `1px solid ${mod.done ? "rgba(201,168,76,0.25)" : "var(--border)"}` }}>
                <div className="flex items-center gap-3 p-3">
                  <button onClick={() => toggleModule(mod.id, mod.done)}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: mod.done ? "linear-gradient(135deg, var(--gold-dark), var(--gold))" : "transparent", border: mod.done ? "none" : "2px solid var(--border)" }}>
                    {mod.done && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: mod.done ? "var(--gold)" : "var(--foreground)", opacity: mod.done ? 0.8 : 1 }}>
                      <span style={{ color: "var(--muted)" }}>M{mod.number}.</span> {mod.name}
                    </p>
                    {content && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                        {content.concepts.length} conceptos · {content.youtubeSearches.length} búsquedas · {content.resources.length} artículos
                      </p>
                    )}
                  </div>
                  {mod.done && <span className="text-xs flex-shrink-0" style={{ color: "#4CAF7D" }}>✓</span>}
                </div>
                <button onClick={() => router.push(`/trading/modulo/${mod.number}`)}
                  className="w-full px-3 py-2 text-xs font-medium text-left transition-all flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--border)", color: "var(--gold)", background: "rgba(201,168,76,0.04)" }}>
                  <span>📚 Ver videos y recursos del módulo</span>
                  <span>→</span>
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>Notas de aprendizaje</h2>
        <Button onClick={() => setShowNoteForm(!showNoteForm)} size="sm">{showNoteForm ? "Cancelar" : "+ Nota"}</Button>
      </div>

      {showNoteForm && (
        <Card>
          <CardHeader><CardTitle>Nueva nota</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Título" placeholder="ej. Patrones de velas japonesas" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} />
            <Textarea label="Contenido" placeholder="Escribe lo que aprendiste..." value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} rows={4} />
            <Button onClick={saveNote} disabled={saving} className="w-full">{saving ? "Guardando..." : "Guardar nota"}</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {notes.map(note => (
          <Card key={note.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{note.title}</h3>
                <p className="text-xs mt-0.5 mb-2" style={{ color: "var(--muted)" }}>
                  {new Date(note.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-2, var(--muted))" }}>{note.content}</p>
              </div>
              <button onClick={() => deleteNote(note.id)} className="opacity-40 hover:opacity-100 transition-opacity text-xs p-1" style={{ color: "var(--error)" }}>✕</button>
            </div>
          </Card>
        ))}
        {notes.length === 0 && (
          <div className="text-center py-8" style={{ color: "var(--muted)" }}>
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">Aún no tienes notas</p>
          </div>
        )}
      </div>
    </div>
  );
}
