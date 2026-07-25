// Helpers for reading values out of a submitted FormData.

export function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function reqStr(fd: FormData, key: string, fallback = ""): string {
  return str(fd, key) ?? fallback;
}

export function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v == null) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function reqNum(fd: FormData, key: string, fallback = 0): number {
  return num(fd, key) ?? fallback;
}

export function date(fd: FormData, key: string): Date | null {
  const v = str(fd, key);
  if (v == null) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** Generate a sequential document number like PDH-2026-0007 */
export function docNumber(prefix: string, count: number, year = new Date().getFullYear()) {
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}
