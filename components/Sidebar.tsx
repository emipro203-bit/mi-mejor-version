"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";

const navItems = [
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
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40"
      style={{ background: "var(--background)", borderRight: "1px solid var(--border)" }}>
      <div className="px-6 py-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <div>
          <h1 className="text-xl font-bold" style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Mi Mejor Versión
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>tracker personal</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200")}
              style={{
                background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                color: isActive ? "var(--gold)" : "var(--muted)",
                border: isActive ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
              }}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
        {session?.user && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(201,168,76,0.2)", color: "var(--gold)" }}>
              {(session.user.name || session.user.email || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
                {session.user.name || session.user.email}
              </p>
              {session.user.name && (
                <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>{session.user.email}</p>
              )}
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
          style={{ color: "var(--muted)", border: "1px solid var(--border)" }}>
          Cerrar sesión →
        </button>
        <p className="text-xs px-2" style={{ color: "var(--muted)" }}>
          {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
    </aside>
  );
}
