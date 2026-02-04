import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconden naar m:ss.s (bijv. 42.3 → "0:42.3", 65.5 → "1:05.5") */
export function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const s = sec.toFixed(1);
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
