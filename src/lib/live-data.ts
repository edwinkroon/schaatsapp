import type { LapData } from "@/hooks/useLiveLapsData";
import type { SchaatsLap } from "./data";
import { dateToLocalDateString } from "./utils";

/**
 * Parse lap time string to seconds.
 * Supports: "01:10.356" (MM:SS.mmm), "42.3" (seconds), "00:00.000"
 */
export function parseLapTimeToSeconds(time: string): number {
  if (!time || !time.trim()) return 0;
  const t = time.trim();
  const colonIdx = t.indexOf(":");
  if (colonIdx >= 0) {
    const min = parseInt(t.slice(0, colonIdx), 10) || 0;
    const rest = t.slice(colonIdx + 1);
    const secMatch = rest.match(/^(\d+)(?:\.(\d+))?/);
    const sec = parseInt(secMatch?.[1] ?? "0", 10) || 0;
    const ms = parseInt((secMatch?.[2] ?? "0").padEnd(3, "0").slice(0, 3), 10) || 0;
    return min * 60 + sec + ms / 1000;
  }
  return parseFloat(t) || 0;
}

/**
 * Convert LapData (from VinkSite API) to SchaatsLap (for charts).
 */
export function lapDataToSchaatsLaps(
  laps: LapData[],
  transponder: string
): SchaatsLap[] {
  const result: SchaatsLap[] = [];
  let seq = 1;
  for (const lap of laps) {
    const lapTime = parseLapTimeToSeconds(lap.time);
    if (lapTime <= 0) continue; // Skip session-start markers (00:00.000)
    const snelheid =
      lapTime > 0 ? Math.round((1440 / lapTime) * 10) / 10 : 0;
    result.push({
      lap_num: seq++,
      lap_time: Math.round(lapTime * 100) / 100,
      baan: lap.venue || "Onbekend",
      datum: lap.date || dateToLocalDateString(new Date()),
      snelheid,
      transponder,
    });
  }
  return result;
}
