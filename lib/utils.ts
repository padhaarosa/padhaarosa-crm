import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupees (no decimals by default). */
export function inr(amount: number | null | undefined, opts?: { decimals?: boolean }) {
  const n = amount ?? 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: opts?.decimals ? 2 : 0,
    minimumFractionDigits: opts?.decimals ? 2 : 0,
  }).format(n);
}

/** Compact currency for KPI tiles, e.g. ₹12.5L, ₹1.2Cr */
export function inrCompact(amount: number | null | undefined) {
  const n = amount ?? 0;
  if (Math.abs(n) >= 10000000) return "₹" + (n / 10000000).toFixed(2).replace(/\.00$/, "") + " Cr";
  if (Math.abs(n) >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.00$/, "") + " L";
  if (Math.abs(n) >= 1000) return "₹" + (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return "₹" + n.toFixed(0);
}

export function fmtDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const dt = typeof date === "string" ? new Date(date) : date;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  const dt = typeof date === "string" ? new Date(date) : date;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function fmtDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const dt = typeof date === "string" ? new Date(date) : date;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " + dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/** Days between now and a date. Negative = in the past. */
export function daysFromNow(date: Date | string | null | undefined) {
  if (!date) return null;
  const dt = typeof date === "string" ? new Date(date) : date;
  const ms = dt.getTime() - Date.now();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function relativeDay(date: Date | string | null | undefined) {
  const days = daysFromNow(date);
  if (days === null) return "—";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return Math.abs(days) + " days ago";
  return "in " + days + " days";
}

export function nights(start: Date | string, end: Date | string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const n = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(0, n);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Deterministic avatar color from a string. */
export function avatarColor(seed: string) {
  const palette = ["#C15A3F", "#6E5F72", "#A97D3B", "#7A3535", "#8A7A8E", "#A8432B"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function slugToTitle(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

/** Format a Date for an <input type="date"> value (yyyy-mm-dd, local). */
export function dateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
