"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
      }}
      title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
