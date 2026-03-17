"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/hoy", label: "Hoy", icon: "☀️" },
  { href: "/negocio", label: "Negocio", icon: "💎" },
  { href: "/correr", label: "Correr", icon: "🏃" },
  { href: "/sueno", label: "Sueño", icon: "🌙" },
  { href: "/metas", label: "Metas", icon: "🎯" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(13, 11, 8, 0.95)",
        borderTop: "1px solid #2E2A22",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-bottom">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "opacity-100"
                  : "opacity-40 hover:opacity-70"
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#C9A84C" : "#F5F0E8" }}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: "#C9A84C" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
