"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const PRIMARY = [
  { href: "/hoy", label: "Hoy", icon: "☀️" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/logros", label: "Logros", icon: "🏆" },
  { href: "/pomodoro", label: "Foco", icon: "🍅" },
];

const ALL_PAGES = [
  { href: "/hoy", label: "Dashboard del Día", icon: "☀️" },
  { href: "/negocio", label: "Mi Negocio", icon: "🏪" },
  { href: "/correr", label: "Running Log", icon: "🏃" },
  { href: "/sueno", label: "Sueño", icon: "🌙" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/trading", label: "Trading", icon: "📈" },
  { href: "/stats", label: "Estadísticas", icon: "📊" },
  { href: "/calendario", label: "Calendario", icon: "📅" },
  { href: "/recordatorios", label: "Recordatorios", icon: "🔔" },
  { href: "/pomodoro", label: "Pomodoro", icon: "🍅" },
  { href: "/logros", label: "Logros", icon: "🏆" },
  { href: "/cuenta", label: "Mi Cuenta", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Slide-up menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{
              background: "var(--background)",
              borderTop: "1px solid var(--border)",
              borderRadius: "20px 20px 0 0",
              maxHeight: "75vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border)" }} />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between flex-shrink-0"
              style={{ padding: "4px 20px 12px" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", fontFamily: "'Playfair Display', serif" }}>
                Navegación
              </span>
              <ThemeToggle />
            </div>

            {/* Scrollable list */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0 12px 24px" }}>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PAGES.map(item => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl transition-all"
                      style={{
                        padding: "14px 16px",
                        background: isActive ? "rgba(201,168,76,0.12)" : "var(--surface)",
                        border: `1px solid ${isActive ? "rgba(201,168,76,0.35)" : "var(--border)"}`,
                      }}
                    >
                      <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? "var(--gold)" : "var(--foreground)",
                        lineHeight: 1.3,
                      }}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center" style={{ padding: "6px 0 10px" }}>
          {PRIMARY.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 flex-1"
                style={{ padding: "2px 0" }}
              >
                <span style={{ fontSize: 22, lineHeight: 1.2, opacity: isActive ? 1 : 0.38 }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isActive ? "var(--gold)" : "var(--muted)",
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Más button */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex flex-col items-center gap-1 flex-1"
            style={{ padding: "2px 0", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: 22, lineHeight: 1.2, opacity: menuOpen ? 1 : 0.38 }}>
              {menuOpen ? "✕" : "☰"}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: menuOpen ? "var(--gold)" : "var(--muted)",
            }}>
              Más
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
