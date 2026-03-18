"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Mode = "work" | "short" | "long";

const MODES: Record<Mode, { label: string; minutes: number; color: string }> = {
  work: { label: "Trabajo", minutes: 25, color: "var(--gold)" },
  short: { label: "Descanso", minutes: 5, color: "#4CAF7D" },
  long: { label: "Descanso largo", minutes: 15, color: "#5C9BE0" },
};

function beep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
  } catch { /* ignore audio errors */ }
}

function savePomodoroSession() {
  const today = new Date().toISOString().split("T")[0];
  const key = `pomodoro_${today}`;
  const todayCount = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(todayCount));
  const total = parseInt(localStorage.getItem("pomodoro_total") || "0") + 1;
  localStorage.setItem("pomodoro_total", String(total));

  // Sync pomodoro badges to server
  fetch("/api/badges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pomodoroTotal: total }),
  }).catch(() => null);

  return { todayCount, total };
}

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(MODES.work.minutes * 60);
  const [running, setRunning] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(0);
  const modeRef = useRef(mode);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Load counts from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setCompletedToday(parseInt(localStorage.getItem(`pomodoro_${today}`) || "0"));
    setTotalPomodoros(parseInt(localStorage.getItem("pomodoro_total") || "0"));
  }, []);

  const changeMode = useCallback((m: Mode) => {
    setMode(m);
    setSecondsLeft(MODES[m].minutes * 60);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSecondsLeft(MODES[modeRef.current].minutes * 60);
    setRunning(false);
  }, []);

  // Timer interval
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Handle completion
  useEffect(() => {
    if (secondsLeft !== 0 || !running) return;
    setRunning(false);
    beep();
    if (modeRef.current === "work") {
      const { todayCount, total } = savePomodoroSession();
      setCompletedToday(todayCount);
      setTotalPomodoros(total);
      if (todayCount % 4 === 0) {
        changeMode("long");
      } else {
        changeMode("short");
      }
    } else {
      changeMode("work");
    }
  }, [secondsLeft, running, changeMode]);

  const totalSeconds = MODES[mode].minutes * 60;
  const progress = (totalSeconds - secondsLeft) / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const color = MODES[mode].color;

  const R = 90;
  const circumference = 2 * Math.PI * R;
  const dashoffset = circumference * (1 - progress);

  const sessionDots = [1, 2, 3, 4];
  const filledDots = completedToday % 4;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Pomodoro</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Técnica de concentración profunda</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button key={m} onClick={() => changeMode(m)}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: mode === m ? "rgba(201,168,76,0.15)" : "var(--surface)",
              border: `1px solid ${mode === m ? "rgba(201,168,76,0.4)" : "var(--border)"}`,
              color: mode === m ? "var(--gold)" : "var(--muted)",
            }}>
            {MODES[m].label}
            <span className="block text-[10px] mt-0.5 opacity-70">{MODES[m].minutes} min</span>
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="224" height="224" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="112" cy="112" r={R} fill="none" strokeWidth="8"
              stroke="var(--border)" />
            <circle cx="112" cy="112" r={R} fill="none" strokeWidth="8"
              stroke={color}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums" style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--foreground)",
            }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs mt-2 px-3 py-1 rounded-full" style={{
              background: "var(--surface)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
            }}>
              {MODES[mode].label}
            </span>
          </div>
        </div>

        {/* Session dots */}
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--muted)" }}>Sesiones:</span>
          <div className="flex gap-2">
            {sessionDots.map(i => (
              <div key={i} className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  background: i <= filledDots ? color : "var(--border)",
                  boxShadow: i <= filledDots ? `0 0 6px ${color}80` : "none",
                }} />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={reset}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all active:scale-95"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            ↺
          </button>
          <button onClick={() => setRunning(r => !r)}
            className="px-12 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: running
                ? "var(--surface)"
                : "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              border: running ? `1px solid ${color}` : "none",
              color: running ? color : "var(--background)",
              boxShadow: !running ? "0 4px 15px rgba(201,168,76,0.3)" : "none",
            }}>
            {running ? "Pausar" : secondsLeft < totalSeconds ? "Continuar" : "Iniciar"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: completedToday, label: "sesiones hoy" },
          { value: `${completedToday * 25}m`, label: "enfocado hoy" },
          { value: totalPomodoros, label: "total histórico" },
        ].map(s => (
          <div key={s.label} className="card text-center py-3">
            <div className="text-xl font-bold" style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>
              {s.value}
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl space-y-2" style={{
        background: "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 100%)",
        border: "1px solid rgba(201,168,76,0.15)",
      }}>
        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Cómo funciona</p>
        <div className="space-y-1">
          {[
            "🍅  Trabaja 25 minutos sin interrupciones",
            "☕  Toma 5 minutos de descanso",
            "🔄  Repite 4 veces",
            "🛋️  Después de 4 sesiones, descansa 15 minutos",
          ].map(step => (
            <p key={step} className="text-xs" style={{ color: "var(--muted)" }}>{step}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
