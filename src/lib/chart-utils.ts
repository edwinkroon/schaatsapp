import { getISOWeek, getISOWeekYear } from "date-fns";
import { getSeasonFromDate, type SchaatsLap } from "./data";

const WEEKDAYS = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

export function getLapTimeChartData(laps: SchaatsLap[]) {
  return laps.map((lap, i) => ({
    lap: i + 1,
    lapTime: lap.lap_time,
    snelheid: lap.snelheid,
    baan: lap.baan,
    datum: lap.datum,
  }));
}

/** Snelste tijd ooit over 5 opeenvolgende ronden (totaal + gem. snelheid + datum) */
export function getBest5LapsStats(laps: SchaatsLap[]): {
  totalTime: number | null;
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
  let bestTotalTime: number | null = null;
  let bestAvgSpeed: number | null = null;
  let bestDate: string | null = null;
  for (const [datum, sessionLaps] of byDate.entries()) {
    const sorted = [...sessionLaps].sort((a, b) => a.lap_num - b.lap_num);
    for (let i = 0; i + 5 <= sorted.length; i++) {
      const five = sorted.slice(i, i + 5);
      const totalTime = five.reduce((s, l) => s + l.lap_time, 0);
      if (bestTotalTime === null || totalTime < bestTotalTime) {
        bestTotalTime = totalTime;
        bestAvgSpeed = totalTime > 0 ? Math.round((7200 / totalTime) * 10) / 10 : null;
        bestDate = datum;
      }
    }
  }
  return {
    totalTime: bestTotalTime !== null ? Math.round(bestTotalTime * 100) / 100 : null,
    avgSpeed: bestAvgSpeed,
    date: bestDate,
  };
}

export function getTop10Bests(laps: SchaatsLap[]) {
  return [...laps]
    .sort((a, b) => a.lap_time - b.lap_time)
    .slice(0, 10)
    .map((lap, i) => ({
      rank: i + 1,
      lap_num: lap.lap_num,
      lap_time: lap.lap_time,
      snelheid: lap.snelheid,
      datum: lap.datum,
      baan: lap.baan,
    }));
}

export function getSeasonHeatmapData(laps: SchaatsLap[]) {
  const byDate = new Map<string, number>();
  for (const lap of laps) {
    const count = byDate.get(lap.datum) ?? 0;
    byDate.set(lap.datum, count + 1);
  }
  const maxLaps = Math.max(1, ...byDate.values());
  return Array.from(byDate.entries()).map(([datum, count]) => ({
    datum,
    laps: count,
    intensity: count / maxLaps,
  }));
}

export function getWeekdayData(laps: SchaatsLap[]) {
  const byDay = new Map<number, { laps: number; totalTime: number }>();
  for (let i = 0; i < 7; i++) byDay.set(i, { laps: 0, totalTime: 0 });

  for (const lap of laps) {
    const d = new Date(lap.datum + "T12:00:00");
    const day = d.getDay();
    const cur = byDay.get(day)!;
    cur.laps += 1;
    cur.totalTime += lap.lap_time;
  }

  return WEEKDAYS.map((label, i) => {
    const { laps, totalTime } = byDay.get(i)!;
    return {
      weekday: label,
      laps,
      avgTime: laps > 0 ? Math.round((totalTime / laps) * 100) / 100 : 0,
    };
  });
}

/** Beste lap tijd per week voor progressiegrafiek (ISO week) */
export function getProgressData(laps: SchaatsLap[]) {
  const byWeek = new Map<string, number>();
  for (const lap of laps) {
    if (!lap.datum) continue;
    const d = new Date(lap.datum + "T12:00:00");
    const key = `${getISOWeekYear(d)}-W${String(getISOWeek(d)).padStart(2, "0")}`;
    const current = byWeek.get(key);
    if (current === undefined || lap.lap_time < current) {
      byWeek.set(key, lap.lap_time);
    }
  }
  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, bestTime]) => ({ week, bestTime }));
}

/** Aantal ronden per seizoen (okt–apr, bijv. 2024-2025) */
export function getLapsPerSeasonData(laps: SchaatsLap[]) {
  const bySeason = new Map<string, number>();
  for (const lap of laps) {
    const season = getSeasonFromDate(lap.datum ?? "");
    if (!season) continue;
    bySeason.set(season, (bySeason.get(season) ?? 0) + 1);
  }
  return Array.from(bySeason.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([season, count]) => ({ season, laps: count }));
}

export function getVenueComparisonData(laps: SchaatsLap[]) {
  const byVenue = new Map<
    string,
    { laps: number; totalTime: number; totalSnelheid: number }
  >();

  for (const lap of laps) {
    const cur = byVenue.get(lap.baan) ?? {
      laps: 0,
      totalTime: 0,
      totalSnelheid: 0,
    };
    cur.laps += 1;
    cur.totalTime += lap.lap_time;
    cur.totalSnelheid += lap.snelheid;
    byVenue.set(lap.baan, cur);
  }

  return Array.from(byVenue.entries()).map(([baan, { laps, totalTime, totalSnelheid }]) => ({
    baan,
    laps,
    avgLapTime: Math.round((totalTime / laps) * 100) / 100,
    avgSnelheid: Math.round((totalSnelheid / laps) * 10) / 10,
  }));
}
