import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function getRunningZone(hr: number, maxHr: number = 205): string {
  const pct = (hr / maxHr) * 100;
  if (pct < 60) return "Z1";
  if (pct < 70) return "Z2";
  if (pct < 80) return "Z3";
  if (pct < 90) return "Z4";
  return "Z5";
}

export function paceFromDistanceTime(km: number, minutes: number): string {
  const paceMin = minutes / km;
  const mins = Math.floor(paceMin);
  const secs = Math.round((paceMin - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function percentOf(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}
