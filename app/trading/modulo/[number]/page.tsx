"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { MODULE_CONTENT } from "@/lib/trading-resources";

interface TradingModule { id: string; number: number; name: string; done: boolean; }

const SOURCE_ICONS: Record<string, string> = {
  Investopedia: "📊", BabyPips: "🐣", TradingView: "📈",
  Myfxbook: "🔢", Amazon: "📖", IG: "💹",
};

export default function ModuloDetailPage() {
  const params = useParams();
  const router = useRouter();
  const number = parseInt(params.number as string);
  const content = MODULE_CONTENT[number];
  const [module, setModule] = useState<TradingModule | null>(null);

  useEffect(() => {
    fetch("/api/trading").then(r => r.json()).then(data => {
      const mod = data.modules?.find((m: TradingModule) => m.number === number);
      if (mod) setModule(mod);
    });
  }, [number]);

  const toggleDone = async () => {
    if (!module) return;
    const newDone = !module.done;
    setModule({ ...module, done: newDone });
    await fetch("/api/trading", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: module.id, done: newDone }) });
  };

  if (!content) {
    return <div className="text-center py-20" style={{ color: "var(--muted)" }}>Módulo no encontrado</div>;
  }

  return (
    <div className="space-y-5">
      <button onClick={() => router.push("/trading")}
        className="flex items-center gap-2 text-sm transition-opacity hover:opacity-100 opacity-60"
        style={{ color: "var(--gold)" }}>
        ← Volver al programa
      </button>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)" }}>
            Módulo {content.number}
          </span>
          {module?.done && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "rgba(76,175,125,0.15)", color: "#4CAF7D" }}>
              ✓ Completado
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {content.emoji} {content.name}
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--muted-2, var(--muted))" }}>{content.description}</p>
      </div>

      <button onClick={toggleDone}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
        style={{
          background: module?.done ? "rgba(76,175,125,0.12)" : "linear-gradient(135deg, var(--gold-dark), var(--gold))",
          border: module?.done ? "1px solid rgba(76,175,125,0.3)" : "none",
          color: module?.done ? "#4CAF7D" : "var(--background)",
        }}>
        {module?.done ? "✓ Módulo completado — toca para deshacer" : "Marcar módulo como completado"}
      </button>

      <Card>
        <CardHeader><CardTitle>Conceptos clave</CardTitle></CardHeader>
        <div className="space-y-2.5">
          {content.concepts.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold"
                style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)" }}>
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>{c}</span>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
          📺 Videos en YouTube
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Toca para buscar directamente en YouTube</p>
        <div className="space-y-2">
          {content.youtubeSearches.map(s => (
            <a key={s.query}
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.query)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{ background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,80,80,0.2)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,0,0,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,0,0,0.06)")}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base" style={{ background: "rgba(255,0,0,0.15)" }}>▶</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                  {s.lang === "es" ? "🇲🇽 Buscar en español" : "🇺🇸 Search in English"}
                </p>
              </div>
              <span style={{ color: "#FF6B6B", fontSize: 18 }}>→</span>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
          📄 Artículos y guías
        </h2>
        <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>Recursos escritos recomendados</p>
        <div className="space-y-2">
          {content.resources.map(r => (
            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-xl transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <span className="text-xl flex-shrink-0 mt-0.5">{SOURCE_ICONS[r.source] || "📰"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{r.title}</p>
                {r.description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>{r.description}</p>}
                <p className="text-xs mt-1 font-medium" style={{ color: "var(--gold)" }}>{r.source} · {r.lang === "es" ? "Español" : "Inglés"}</p>
              </div>
              <span className="text-sm flex-shrink-0 mt-1" style={{ color: "var(--gold)" }}>→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(92,155,224,0.06)", border: "1px solid rgba(92,155,224,0.2)" }}>
        <span className="text-2xl">🔍</span>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>¿Quieres más?</p>
          <a href={`https://www.google.com/search?q=${encodeURIComponent(content.name + " forex guia completa")}`}
            target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--info)" }}>
            Buscar &ldquo;{content.name}&rdquo; en Google →
          </a>
        </div>
      </div>
    </div>
  );
}
