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
 * Schaatsseizoen = oktober–april (geen schaatsen in zomer).
 * Seizoen 2024-2025 = 2024-10-01 t/m 2025-04-30.
 * Geef het seizoen (bijv. "2024-2025") voor een datum, of null als buiten seizoen (mei–sep).
 */
export function getSeasonFromDate(datum: string): string | null {
  if (!datum) return null;
  const d = new Date(datum + "T12:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  if (month >= 4 && month <= 8) return null;
  const seasonStartYear = month >= 9 ? year : year - 1;
  return `${seasonStartYear}-${seasonStartYear + 1}`;
}

/**
 * Haal beste rondetijd van het huidige seizoen (oktober–april).
 * Mei–sep = off-season, dan het afgelopen seizoen.
 * Retourneert { time, speed, date } – speed is snelheid (km/h) van die ronde.
 */
export function getBestLapTimeThisSeason(laps: SchaatsLap[]): {
  time: number | null;
  speed: number | null;
  date: string | null;
} {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const seasonStartYear = month >= 9 ? year : year - 1;
  const seasonStart = `${seasonStartYear}-10-01`;
  const seasonEnd = `${seasonStartYear + 1}-04-30`;

  let bestTime: number | null = null;
  let bestSpeed: number | null = null;
  let bestDate: string | null = null;
  for (const lap of laps) {
    if (!lap.datum || lap.datum < seasonStart || lap.datum > seasonEnd) continue;
    if (bestTime === null || lap.lap_time < bestTime) {
      bestTime = lap.lap_time;
      bestSpeed = Math.round(lap.snelheid * 10) / 10;
      bestDate = lap.datum;
    }
  }
  return { time: bestTime, speed: bestSpeed, date: bestDate };
}

/**
 * Meeste ronden binnen 1 uur (elk uur-window, per sessie).
 * Binnen een sessie (zelfde datum) zijn laps opeenvolgend; we zoeken het max aantal
 * opeenvolgende laps waarvan de totale tijd <= 3600 seconden.
 * Retourneert { maxLaps, avgSpeed, date } – avgSpeed is gem. snelheid (km/h) van die ronden.
 */
export function getMaxLapsInOneHour(laps: SchaatsLap[]): {
  maxLaps: number;
  avgSpeed: number | null;
  date: string | null;
} {
  const byDate = new Map<string, SchaatsLap[]>();
  for (const lap of laps) {
    if (!lap.datum) continue;
    const list = byDate.get(lap.datum) ?? [];
    list.push(lap);
    byDate.set(lap.datum, list);
  }
  let max = 0;
  let bestAvgSpeed: number | null = null;
  let bestDate: string | null = null;
  const ONE_HOUR = 3600;
  for (const [datum, sessionLaps] of byDate.entries()) {
    const sorted = [...sessionLaps].sort((a, b) => a.lap_num - b.lap_num);
    for (let i = 0; i < sorted.length; i++) {
      let sum = 0;
      let count = 0;
      let speedSum = 0;
      for (let j = i; j < sorted.length && sum + sorted[j].lap_time <= ONE_HOUR; j++) {
        sum += sorted[j].lap_time;
        speedSum += sorted[j].snelheid;
        count++;
      }
      if (count > max) {
        max = count;
        bestAvgSpeed = count > 0 ? Math.round((speedSum / count) * 10) / 10 : null;
        bestDate = datum;
      }
    }
  }
  return { maxLaps: max, avgSpeed: bestAvgSpeed, date: bestDate };
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
