"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/badges";

interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export default function LogrosPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todos");

  useEffect(() => {
    fetch("/api/badges")
      .then(r => r.json())
      .then(data => {
        setBadges(data.badges ?? []);
        setStreak(data.streak ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const filteredBadges = activeCategory === "todos"
    ? badges
    : badges.filter(b => b.category === activeCategory);

  const categories = ["todos", ...CATEGORIES];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Logros</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Tu progreso y conquistas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
            🔥 {streak}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>racha global</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
            {unlockedCount}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>desbloqueados</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
            {badges.length}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>total</div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-2" style={{ color: "var(--muted)" }}>
          <span>Progreso</span>
          <span>{Math.round((unlockedCount / badges.length) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(unlockedCount / badges.length) * 100}%`,
              background: "linear-gradient(90deg, var(--gold-dark), var(--gold))",
            }} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: activeCategory === cat ? "rgba(201,168,76,0.15)" : "var(--surface)",
              border: `1px solid ${activeCategory === cat ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
              color: activeCategory === cat ? "var(--gold)" : "var(--muted)",
            }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredBadges.map(badge => (
          <div key={badge.id} className="p-4 rounded-xl transition-all"
            style={{
              background: badge.unlocked
                ? "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 100%)"
                : "var(--surface)",
              border: `1px solid ${badge.unlocked ? "rgba(201,168,76,0.3)" : "var(--border)"}`,
              opacity: badge.unlocked ? 1 : 0.5,
            }}>
            <div className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl" style={{ filter: badge.unlocked ? "none" : "grayscale(100%)" }}>
                {badge.icon}
              </span>
              <div>
                <p className="text-xs font-semibold" style={{ color: badge.unlocked ? "var(--gold)" : "var(--foreground)" }}>
                  {badge.name}
                </p>
                <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "var(--muted)" }}>
                  {badge.desc}
                </p>
              </div>
              {badge.unlocked && badge.unlockedAt && (
                <span className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)" }}>
                  ✓ {new Date(badge.unlockedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                </span>
              )}
              {!badge.unlocked && (
                <span className="text-[9px]" style={{ color: "var(--muted)" }}>Bloqueado</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8" style={{ color: "var(--muted)" }}>
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-sm">No hay logros en esta categoría</p>
        </div>
      )}
    </div>
  );
}
