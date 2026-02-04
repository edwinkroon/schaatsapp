import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ChartTabs } from "./ChartTabs";
import { LapTimesList } from "./charts/LapTimesList";
import { StatsCards } from "./StatsCards";
import { useLiveLapsData } from "@/hooks/useLiveLapsData";
import {
  filterLaps,
  filterLapsByDate,
  getBestLapTimeThisSeason,
  getUniqueDatesFromLaps,
  getLapsPerDate,
  type SchaatsLap,
} from "@/lib/data";
import { lapDataToSchaatsLaps } from "@/lib/live-data";
import { getTop10Bests, getVenueComparisonData } from "@/lib/chart-utils";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const LAP_DISTANCE_KM = 0.4;

const DEBOUNCE_MS = 500;
const STORAGE_KEY_TRANSPONDER = "schaatsapp-transponder";

export function Dashboard() {
  const [transponder, setTransponder] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY_TRANSPONDER) || "FZ-62579";
    }
    return "FZ-62579";
  });
  const [debouncedTransponder, setDebouncedTransponder] = useState(transponder);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: liveData, loading, error, refetch } = useLiveLapsData({
    transponder: debouncedTransponder,
    filter: "ALLEMAAL",
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (transponder.trim()) {
      localStorage.setItem(STORAGE_KEY_TRANSPONDER, transponder.trim());
    }
  }, [transponder]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedTransponder(transponder), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [transponder]);

  useEffect(() => {
    if (debouncedTransponder.trim()) {
      refetch();
    }
  }, [debouncedTransponder, refetch]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const allLaps = useMemo(
    () => lapDataToSchaatsLaps(liveData, debouncedTransponder),
    [liveData, debouncedTransponder]
  );

  const filteredLaps = useMemo(
    () => filterLaps(allLaps, "ALLEMAAL"),
    [allLaps]
  );

  const availableDays = useMemo(
    () => getUniqueDatesFromLaps(filteredLaps),
    [filteredLaps]
  );

  const lapsPerDate = useMemo(
    () => getLapsPerDate(filteredLaps),
    [filteredLaps]
  );

  useEffect(() => {
    if (selectedDate && !availableDays.includes(selectedDate)) {
      setSelectedDate("");
    }
  }, [availableDays, selectedDate]);

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0]);
    }
  }, [availableDays, selectedDate]);

  const displayLaps = useMemo(() => {
    if (!selectedDate) return [];
    return filterLapsByDate(filteredLaps, selectedDate);
  }, [filteredLaps, selectedDate]);

  const stats = useMemo(() => {
    const bestLapSeason = getBestLapTimeThisSeason(filteredLaps);
    if (displayLaps.length === 0) {
      return {
        totalLaps: 0,
        avgLapTime: 0,
        avgSnelheid: 0,
        maxSnelheid: 0,
        bestLap: null as SchaatsLap | null,
        bestLapSeason,
        totalDistance: 0,
        personalBests: [] as ReturnType<typeof getTop10Bests>,
        venueStats: [] as ReturnType<typeof getVenueComparisonData>,
      };
    }
    const totalLapTime = displayLaps.reduce((s, l) => s + l.lap_time, 0);
    const totalSnelheid = displayLaps.reduce((s, l) => s + l.snelheid, 0);
    const maxSnelheid = Math.max(...displayLaps.map((l) => l.snelheid));
    const bestLap = displayLaps.reduce((b, l) =>
      l.lap_time < b.lap_time ? l : b
    );
    return {
      totalLaps: displayLaps.length,
      avgLapTime: Math.round((totalLapTime / displayLaps.length) * 100) / 100,
      avgSnelheid: Math.round((totalSnelheid / displayLaps.length) * 10) / 10,
      maxSnelheid: Math.round(maxSnelheid * 10) / 10,
      bestLap,
      bestLapSeason,
      totalDistance:
        Math.round(displayLaps.length * LAP_DISTANCE_KM * 10) / 10,
      personalBests: getTop10Bests(displayLaps),
      venueStats: getVenueComparisonData(displayLaps),
    };
  }, [displayLaps, filteredLaps]);

  return (
    <SidebarProvider>
      <Sidebar
        transponder={transponder}
        onTransponderChange={setTransponder}
        selectedDate={selectedDate}
        availableDays={availableDays}
        lapsPerDate={lapsPerDate}
        onDateChange={setSelectedDate}
        loading={loading}
        hasData={filteredLaps.length > 0}
      />
      <SidebarInset>
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          stats={{
            totalLaps: stats.totalLaps,
            avgLapTime: stats.avgLapTime,
            avgSnelheid: stats.avgSnelheid,
          }}
          sidebarTrigger={<SidebarTrigger />}
        />
        <main
          id="main-content"
          className="bg-dashboard flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 min-w-0"
          role="main"
          aria-label="Dashboard inhoud"
        >
          {error && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}
          {displayLaps.length === 0 && filteredLaps.length === 0 && !loading ? (
            <div className="space-y-3 sm:space-y-4 max-w-full min-w-0">
              <Card className="border-primary/20 shadow-sm">
                <CardHeader className="p-4 sm:p-5">
                  <CardTitle className="text-base sm:text-lg">Welkom bij Schaatsapp</CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Open de sidebar (☰) en vul je transponder-ID in. De data
                    wordt automatisch geladen.
                  </p>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-w-full min-w-0">
              {loading && (
                <p className="text-muted-foreground" role="status">
                  Live data laden...
                </p>
              )}
              {filteredLaps.length > 0 && (
                <>
                  <StatsCards
                    totalLaps={stats.totalLaps}
                    bestLap={stats.bestLap?.lap_time ?? null}
                    bestLapSeason={stats.bestLapSeason}
                    avgSpeed={stats.avgSnelheid}
                    maxSpeed={stats.maxSnelheid}
                    totalDistance={stats.totalDistance}
                  />
                  <LapTimesList laps={displayLaps} />
                  <ChartTabs
                    laps={displayLaps}
                    allLapsForSeasons={filterLaps(allLaps, "ALLEMAAL")}
                    isLoading={loading}
                  />
                </>
              )}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
