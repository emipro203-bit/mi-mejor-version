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
      {/* Full-page menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
            style={{ background: "var(--background)", border: "1px solid var(--border)", borderBottom: "none" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Páginas</span>
              <ThemeToggle />
            </div>

            {/* Grid of all pages */}
            <div className="grid grid-cols-3 gap-2 px-4 pb-6">
              {ALL_PAGES.map(item => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 transition-all"
                    style={{
                      background: isActive ? "rgba(201,168,76,0.12)" : "var(--surface)",
                      border: `1px solid ${isActive ? "rgba(201,168,76,0.3)" : "var(--border)"}`,
                    }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textAlign: "center",
                      color: isActive ? "var(--gold)" : "var(--muted)",
                      lineHeight: 1.3,
                    }}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Safe area spacer */}
            <div style={{ height: 16 }} />
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center" style={{ padding: "6px 0 8px" }}>
          {PRIMARY.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-0.5 flex-1"
                style={{ padding: "4px 0" }}>
                <span style={{ fontSize: 20, lineHeight: 1.2, opacity: isActive ? 1 : 0.4 }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: isActive ? "var(--gold)" : "var(--muted)",
                }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Menu button */}
          <button onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 flex-1"
            style={{ padding: "4px 0", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 20, lineHeight: 1.2, opacity: menuOpen ? 1 : 0.4 }}>☰</span>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.02em",
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
