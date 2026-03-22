export interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  // ── Especial ──
  { id: "early_adopter",     icon: "🌟", name: "Pionero",           desc: "Te uniste a Mi Mejor Versión",                   category: "especial" },

  // ── Hábitos ──
  { id: "habit_first",       icon: "✅", name: "Primer hábito",     desc: "Completa tu primer hábito",                      category: "hábitos" },
  { id: "habit_10",          icon: "🔑", name: "En ritmo",          desc: "Completa 10 hábitos en total",                   category: "hábitos" },
  { id: "habit_100",         icon: "💯", name: "Centenar de hábitos",desc: "Completa 100 hábitos en total",                  category: "hábitos" },
  { id: "habit_500",         icon: "⚡", name: "Imparable",         desc: "Completa 500 hábitos en total",                  category: "hábitos" },
  { id: "habit_perfect_day", icon: "💎", name: "Día perfecto",      desc: "Completa todos tus hábitos en un mismo día",     category: "hábitos" },
  { id: "habit_perfect_week",icon: "🌈", name: "Semana impecable",  desc: "7 días perfectos a lo largo del tiempo",         category: "hábitos" },

  // ── Rachas ──
  { id: "streak_3",   icon: "🔥", name: "Racha iniciada", desc: "3 días seguidos completando hábitos",   category: "rachas" },
  { id: "streak_7",   icon: "💪", name: "Una semana",     desc: "7 días seguidos completando hábitos",   category: "rachas" },
  { id: "streak_14",  icon: "🗓️", name: "Dos semanas",    desc: "14 días seguidos completando hábitos",  category: "rachas" },
  { id: "streak_30",  icon: "🏆", name: "Mes de hierro",  desc: "30 días seguidos completando hábitos",  category: "rachas" },
  { id: "streak_60",  icon: "🥇", name: "Dos meses",      desc: "60 días seguidos completando hábitos",  category: "rachas" },
  { id: "streak_100", icon: "👑", name: "Leyenda",         desc: "100 días seguidos completando hábitos", category: "rachas" },

  // ── Running ──
  { id: "run_first",      icon: "🏃",  name: "Primera carrera",   desc: "Registra tu primera carrera",                  category: "running" },
  { id: "run_5k",         icon: "5️⃣",  name: "5K completado",     desc: "Corre 5km en una sola sesión",                 category: "running" },
  { id: "run_10k",        icon: "🔟",  name: "10K completado",    desc: "Corre 10km en una sola sesión",                category: "running" },
  { id: "run_half",       icon: "🎽",  name: "Medio maratón",     desc: "Corre 21km en una sola sesión",                category: "running" },
  { id: "run_10",         icon: "👟",  name: "Corredor serio",    desc: "Registra 10 carreras",                         category: "running" },
  { id: "run_50",         icon: "🦵",  name: "50 salidas",        desc: "Registra 50 carreras",                         category: "running" },
  { id: "run_100km",      icon: "💨",  name: "Centenario",        desc: "Acumula 100km corriendo",                      category: "running" },
  { id: "run_500km",      icon: "🚀",  name: "500km acumulados",  desc: "Acumula 500km corriendo",                      category: "running" },
  { id: "run_1000km",     icon: "🌍",  name: "1000km — Élite",    desc: "Acumula 1000km corriendo",                     category: "running" },

  // ── Salud ──
  { id: "water_7",   icon: "💧", name: "Hidratado",        desc: "7 días con meta de agua completa (10 vasos)",  category: "salud" },
  { id: "water_30",  icon: "🌊", name: "Siempre hidratado",desc: "30 días con meta de agua completa",            category: "salud" },
  { id: "sleep_7",   icon: "🌙", name: "Buen sueño",       desc: "Registra 7 noches de sueño",                  category: "salud" },
  { id: "sleep_30",  icon: "😴", name: "Descanso constante",desc: "Registra 30 noches de sueño",                category: "salud" },
  { id: "sleep_100", icon: "🛌", name: "Maestro del sueño", desc: "Registra 100 noches de sueño",               category: "salud" },

  // ── Metas ──
  { id: "goal_first",    icon: "🎯", name: "Primera meta",   desc: "Crea tu primera meta",            category: "metas" },
  { id: "goal_5",        icon: "📋", name: "Ambicioso",      desc: "Crea 5 metas",                    category: "metas" },
  { id: "goal_complete", icon: "✨", name: "Meta cumplida",  desc: "Llega al 100% en alguna meta",    category: "metas" },

  // ── Trading ──
  { id: "trading_complete", icon: "📈", name: "Trader completo", desc: "Completa todos los módulos de trading", category: "trading" },

  // ── Productividad ──
  { id: "pomodoro_10",  icon: "🍅", name: "Enfocado",     desc: "Completa 10 sesiones Pomodoro",  category: "productividad" },
  { id: "pomodoro_50",  icon: "🧠", name: "Mente maestra",desc: "Completa 50 sesiones Pomodoro",  category: "productividad" },
  { id: "pomodoro_100", icon: "🎓", name: "Experto",      desc: "Completa 100 sesiones Pomodoro", category: "productividad" },
  { id: "pomodoro_200", icon: "🔬", name: "Científico",   desc: "Completa 200 sesiones Pomodoro", category: "productividad" },
];

export const CATEGORIES = ["especial", "rachas", "hábitos", "running", "salud", "trading", "metas", "productividad"];
