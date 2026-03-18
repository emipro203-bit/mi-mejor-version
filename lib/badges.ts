export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: "early_adopter", icon: "🌟", name: "Pionero", desc: "Te uniste a Mi Mejor Versión", category: "especial" },
  { id: "habit_first", icon: "✅", name: "Primer hábito", desc: "Completa tu primer hábito", category: "hábitos" },
  { id: "habit_perfect_day", icon: "💎", name: "Día perfecto", desc: "Completa todos tus hábitos en un día", category: "hábitos" },
  { id: "streak_3", icon: "🔥", name: "Racha iniciada", desc: "3 días seguidos completando hábitos", category: "rachas" },
  { id: "streak_7", icon: "💪", name: "Una semana", desc: "7 días seguidos completando hábitos", category: "rachas" },
  { id: "streak_30", icon: "🏆", name: "Mes de hierro", desc: "30 días seguidos completando hábitos", category: "rachas" },
  { id: "run_first", icon: "🏃", name: "Primera carrera", desc: "Registra tu primera carrera", category: "running" },
  { id: "run_10", icon: "👟", name: "Corredor serio", desc: "Registra 10 carreras", category: "running" },
  { id: "run_100km", icon: "💨", name: "Centenario", desc: "Corre 100km en total", category: "running" },
  { id: "water_7", icon: "💧", name: "Hidratado", desc: "7 días con meta de agua completa (10 vasos)", category: "salud" },
  { id: "sleep_7", icon: "🌙", name: "Buen sueño", desc: "Registra 7 noches de sueño", category: "salud" },
  { id: "trading_complete", icon: "📈", name: "Trader completo", desc: "Completa todos los módulos de trading", category: "trading" },
  { id: "goal_first", icon: "🎯", name: "Primera meta", desc: "Crea tu primera meta", category: "metas" },
  { id: "pomodoro_10", icon: "🍅", name: "Enfocado", desc: "Completa 10 sesiones Pomodoro", category: "productividad" },
  { id: "pomodoro_50", icon: "🧠", name: "Mente maestra", desc: "Completa 50 sesiones Pomodoro", category: "productividad" },
];

export const CATEGORIES = ["especial", "rachas", "hábitos", "running", "salud", "trading", "metas", "productividad"];
