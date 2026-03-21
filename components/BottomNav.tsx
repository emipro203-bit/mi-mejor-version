"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hoy", label: "Hoy", icon: "☀️" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/logros", label: "Logros", icon: "🏆" },
  { href: "/pomodoro", label: "Foco", icon: "🍅" },
  { href: "/cuenta", label: "Cuenta", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: "var(--background)", borderTop: "1px solid var(--border)" }}>
      <div className="flex items-center justify-around" style={{ padding: "6px 4px 8px" }}>
        {navItems.map((item) => {
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
      </div>
    </nav>
  );
}
