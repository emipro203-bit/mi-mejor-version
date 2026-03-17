"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hoy", label: "Dashboard del Día", icon: "☀️" },
  { href: "/negocio", label: "Secreto Perfumista", icon: "💎" },
  { href: "/correr", label: "Running Log", icon: "🏃" },
  { href: "/sueno", label: "Sueño", icon: "🌙" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/trading", label: "Trading", icon: "📈" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-40"
      style={{
        background: "#0D0B08",
        borderRight: "1px solid #2E2A22",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-8 border-b" style={{ borderColor: "#2E2A22" }}>
        <h1
          className="text-xl font-bold"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #C9A84C 0%, #E8C875 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Mi Mejor Versión
        </h1>
        <p className="text-xs mt-1" style={{ color: "#6B6355" }}>
          tracker personal
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                background: isActive ? "rgba(201, 168, 76, 0.15)" : "transparent",
                color: isActive ? "#C9A84C" : "#6B6355",
                border: isActive ? "1px solid rgba(201, 168, 76, 0.2)" : "1px solid transparent",
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t" style={{ borderColor: "#2E2A22" }}>
        <p className="text-xs" style={{ color: "#6B6355" }}>
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>
    </aside>
  );
}
