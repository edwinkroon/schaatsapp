import type { SchaatsLap } from "./data";

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
