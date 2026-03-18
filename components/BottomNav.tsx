"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { href: "/hoy", label: "Hoy", icon: "☀️" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/calendario", label: "Cal", icon: "📅" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/recordatorios", label: "Avisos", icon: "🔔" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ background: "var(--background)", borderTop: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium"
                style={{ color: isActive ? "var(--gold)" : "var(--foreground)" }}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center gap-1 px-2 py-1.5 opacity-60">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
