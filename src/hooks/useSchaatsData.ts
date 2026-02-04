import { useState, useCallback, useMemo, useRef } from "react";
import {
  getMockSchaatsData,
  parseSchaatsCSV,
  toSchaatsCSV,
  filterLaps,
  filterLapsByTransponder,
  filterLapsByRange,
  type SchaatsLap,
  type FilterType,
} from "@/lib/data";
import { getTop10Bests, getVenueComparisonData } from "@/lib/chart-utils";

const LAP_DISTANCE_KM = 0.4; // 400m per lap

interface Stats {
  totalLaps: number;
  avgLapTime: number;
  avgSnelheid: number;
  bestLap: SchaatsLap | null;
  worstLap: SchaatsLap | null;
  totalDistance: number;
  personalBests: ReturnType<typeof getTop10Bests>;
  venueStats: ReturnType<typeof getVenueComparisonData>;
}

interface UseSchaatsDataReturn {
  laps: SchaatsLap[];
  filteredLaps: SchaatsLap[];
  isLoading: boolean;
  error: string | null;
  transponder: string;
  setTransponder: (id: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  minLaps: number;
  maxLaps: number;
  setLapsRange: (min: number, max: number) => void;
  loadMockData: () => void;
  stopLoading: () => void;
  loadFromCSV: (csvString: string) => void;
  exportToCSV: () => string;
  downloadCsv: (filename?: string) => void;
  clearData: () => void;
  stats: Stats;
}

export function useSchaatsData(): UseSchaatsDataReturn {
  const [laps, setLaps] = useState<SchaatsLap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transponder, setTransponder] = useState("FZ-62579");
  const [filterType, setFilterType] = useState<FilterType>("ALLEMAAL");
  const [minLaps, setMinLaps] = useState(20);
  const [maxLaps, setMaxLaps] = useState(140);
  const abortRef = useRef(false);

  const setLapsRange = useCallback((min: number, max: number) => {
    setMinLaps(min);
    setMaxLaps(max);
  }, []);

  const loadMockData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    abortRef.current = false;

    const count = Math.min(
      200,
      Math.max(1, Math.floor(minLaps + Math.random() * (maxLaps - minLaps + 1)))
    );

    setTimeout(() => {
      if (abortRef.current) {
        setIsLoading(false);
        return;
      }
      try {
        const data = getMockSchaatsData(transponder, count);
        setLaps(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fout bij laden data");
      } finally {
        setIsLoading(false);
      }
    }, 800);
  }, [transponder, minLaps, maxLaps]);

  const stopLoading = useCallback(() => {
    abortRef.current = true;
    setIsLoading(false);
  }, []);

  const loadFromCSV = useCallback((csvString: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = parseSchaatsCSV(csvString);
      setLaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout bij parsen CSV");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredLaps = useMemo(() => {
    let result = laps;
    result = filterLapsByTransponder(result, transponder);
    result = filterLapsByRange(result, minLaps, maxLaps);
    result = filterLaps(result, filterType);
    return result;
  }, [laps, transponder, minLaps, maxLaps, filterType]);

  const exportToCSV = useCallback(() => {
    return toSchaatsCSV(filteredLaps);
  }, [filteredLaps]);

  const downloadCsv = useCallback(
    (filename?: string) => {
      const csv = exportToCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? `schaatsdata-${transponder || "export"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [exportToCSV, transponder]
  );

  const clearData = useCallback(() => {
    setLaps([]);
    setError(null);
  }, []);

  const stats = useMemo((): Stats => {
    const data = filteredLaps;
    if (data.length === 0) {
      return {
        totalLaps: 0,
        avgLapTime: 0,
        avgSnelheid: 0,
        bestLap: null,
        worstLap: null,
        totalDistance: 0,
        personalBests: [],
        venueStats: [],
      };
    }

    const totalLapTime = data.reduce((sum, lap) => sum + lap.lap_time, 0);
    const totalSnelheid = data.reduce((sum, lap) => sum + lap.snelheid, 0);
    const bestLap = data.reduce((best, lap) =>
      lap.lap_time < best.lap_time ? lap : best
    );
    const worstLap = data.reduce((worst, lap) =>
      lap.lap_time > worst.lap_time ? lap : worst
    );

    return {
      totalLaps: data.length,
      avgLapTime: Math.round((totalLapTime / data.length) * 100) / 100,
      avgSnelheid: Math.round((totalSnelheid / data.length) * 10) / 10,
      bestLap,
      worstLap,
      totalDistance: Math.round(data.length * LAP_DISTANCE_KM * 10) / 10,
      personalBests: getTop10Bests(data),
      venueStats: getVenueComparisonData(data),
    };
  }, [filteredLaps]);

  return {
    laps,
    filteredLaps,
    isLoading,
    error,
    transponder,
    setTransponder,
    filterType,
    setFilterType,
    minLaps,
    maxLaps,
    setLapsRange,
    loadMockData,
    stopLoading,
    loadFromCSV,
    exportToCSV,
    downloadCsv,
    clearData,
    stats,
  };
}
