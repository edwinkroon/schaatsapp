import Papa from "papaparse";

export interface SchaatsLap {
  lap_num: number;
  lap_time: number; // in seconds
  baan: string;
  datum: string;
  snelheid: number; // km/h
  transponder: string;
}

const BANEN = ["Binnen", "Buiten", "Gemengd"];
const BASE_DATE = new Date("2025-01-15");

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export type FilterType = "ALLEMAAL" | "BESTE" | "SLECHTSTE";

/**
 * Filter laps op type: ALLEMAAL (alles), BESTE (snelste 25%), SLECHTSTE (traagste 25%)
 */
export function filterLapsByTransponder(
  laps: SchaatsLap[],
  transponder: string
): SchaatsLap[] {
  if (!transponder.trim()) return laps;
  return laps.filter((l) => l.transponder === transponder.trim());
}

export function filterLapsByRange(
  laps: SchaatsLap[],
  minLaps: number,
  maxLaps: number
): SchaatsLap[] {
  if (minLaps <= 0 || maxLaps >= 1000) return laps;
  return laps.filter(
    (l) => l.lap_num >= minLaps && l.lap_num <= maxLaps
  );
}

/**
 * Filter laps op datum (YYYY-MM-DD)
 */
export function filterLapsByDate(
  laps: SchaatsLap[],
  date: string
): SchaatsLap[] {
  if (!date) return laps;
  return laps.filter((l) => l.datum === date);
}

/**
 * Haal unieke datums uit laps, gesorteerd van nieuw naar oud
 */
export function getUniqueDatesFromLaps(laps: SchaatsLap[]): string[] {
  const dates = new Set<string>();
  for (const lap of laps) {
    if (lap.datum) dates.add(lap.datum);
  }
  return Array.from(dates).sort((a, b) => b.localeCompare(a));
}

/**
 * Haal beste rondetijd van het huidige seizoen (juli–juni).
 * Seizoen 2024-2025 = 2024-07-01 t/m 2025-06-30.
 */
export function getBestLapTimeThisSeason(laps: SchaatsLap[]): number | null {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const seasonEndYear = month >= 6 ? year + 1 : year;
  const seasonStart = `${seasonEndYear - 1}-07-01`;
  const seasonEnd = `${seasonEndYear}-06-30`;

  let best: number | null = null;
  for (const lap of laps) {
    if (!lap.datum || lap.datum < seasonStart || lap.datum > seasonEnd) continue;
    if (best === null || lap.lap_time < best) best = lap.lap_time;
  }
  return best;
}

/**
 * Map van datum (YYYY-MM-DD) naar aantal ronden
 */
export function getLapsPerDate(laps: SchaatsLap[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const lap of laps) {
    if (lap.datum) {
      map.set(lap.datum, (map.get(lap.datum) ?? 0) + 1);
    }
  }
  return map;
}

export function filterLaps(
  laps: SchaatsLap[],
  filterType: FilterType
): SchaatsLap[] {
  if (filterType === "ALLEMAAL" || laps.length === 0) return laps;

  const sorted = [...laps].sort((a, b) => a.lap_time - b.lap_time);
  const count = Math.max(1, Math.floor(laps.length * 0.25));

  if (filterType === "BESTE") {
    return sorted.slice(0, count);
  }
  return sorted.slice(-count);
}

/**
 * Genereert mock schaatsdata voor gegeven transponder
 * numLaps laps met lap_time, baan, datum, snelheid
 */
export function generateMockSchaatsData(
  transponder = "FZ-62579",
  numLaps = 100
): SchaatsLap[] {
  const laps: SchaatsLap[] = [];
  let currentDate = new Date(BASE_DATE);
  const total = Math.min(200, Math.max(1, numLaps));

  for (let i = 1; i <= total; i++) {
    // Lap time tussen 35-55 seconden (400m baan)
    const lapTime = Math.round(randomBetween(35, 55) * 100) / 100;
    // Baan willekeurig
    const baan = BANEN[Math.floor(Math.random() * BANEN.length)];
    // Snelheid berekend: 400m = 0.4km, km/h = 0.4 / (lapTime/3600) = 1440/lapTime
    const snelheid = Math.round((1440 / lapTime) * 10) / 10;

    laps.push({
      lap_num: i,
      lap_time: lapTime,
      baan,
      datum: formatDate(currentDate),
      snelheid,
      transponder,
    });

    // Soms naar volgende dag (sessie van ~20-30 laps per dag)
    if (i % Math.floor(randomBetween(20, 30)) === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return laps;
}

function normalizeRow(row: Record<string, unknown>): SchaatsLap | null {
  const get = (keys: string[]) => {
    for (const k of keys) {
      const v = row[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  };
  const lap_num = Number(get(["lap_num", "lap", "ronde"]));
  const lap_time = Number(get(["lap_time", "laptime", "tijd", "time"]));
  const baan = String(get(["baan", "venue", "ijsbaan"]) ?? "");
  const datum = String(get(["datum", "date"]) ?? "");
  const snelheid = Number(get(["snelheid", "speed"])) || (lap_time > 0 ? Math.round((1440 / lap_time) * 10) / 10 : 0);
  const transponder = String(get(["transponder", "id"]) ?? "");

  if (!lap_num || !lap_time) return null;
  return {
    lap_num: Math.round(lap_num),
    lap_time: Math.round(lap_time * 100) / 100,
    baan: baan || "Onbekend",
    datum: datum || new Date().toISOString().split("T")[0],
    snelheid,
    transponder: transponder || "FZ-62579",
  };
}

/**
 * Parse CSV string naar SchaatsLap array met PapaParse
 */
export function parseSchaatsCSV(csvString: string): SchaatsLap[] {
  const result = Papa.parse<Record<string, unknown>>(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (result.errors.length > 0) {
    console.warn("CSV parse errors:", result.errors);
  }

  return result.data.map(normalizeRow).filter((r): r is SchaatsLap => r !== null);
}

/**
 * Converteer SchaatsLap array naar CSV string
 */
export function toSchaatsCSV(laps: SchaatsLap[]): string {
  return Papa.unparse(laps, {
    columns: ["lap_num", "lap_time", "baan", "datum", "snelheid", "transponder"],
  });
}

/**
 * Haal mock schaatsdata op (voor development)
 */
export function getMockSchaatsData(
  transponder = "FZ-62579",
  numLaps = 100
): SchaatsLap[] {
  return generateMockSchaatsData(transponder, numLaps);
}
