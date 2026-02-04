import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format seconden naar ss.hh of mm:ss.hh
 * - Onder de minuut: ss.hh (bijv. 42.35 → "42.35")
 * - Een minuut of meer: mm:ss.hh (bijv. 65.5 → "1:05.50")
 */
export function formatLapTimeSeconds(seconds: number): string {
  if (seconds < 60) {
    return seconds.toFixed(2);
  }
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const s = sec.toFixed(2);
  const [intPart, decPart] = s.split(".");
  const padded = intPart!.padStart(2, "0") + (decPart ? `.${decPart}` : "");
  return `${m}:${padded}`;
}

/** Format seconden naar m:ss.hh (altijd met minuten, bijv. 42.35 → "0:42.35") */
export function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const s = sec.toFixed(2);
  const [intPart, decPart] = s.split(".");
  const padded = intPart!.padStart(2, "0") + (decPart ? `.${decPart}` : "");
  return `${m}:${padded}`;
}

/** Date naar YYYY-MM-DD in lokale tijd (geen UTC) */
export function dateToLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format YYYY-MM-DD naar dd-mm-yyyy */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
