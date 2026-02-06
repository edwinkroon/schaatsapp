import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LapTimeLineChart } from "./charts/LapTimeLineChart";
import { SpeedLineChart } from "./charts/SpeedLineChart";
import { ProgressChart } from "./charts/ProgressChart";
import { LapsPerSeasonBarChart } from "./charts/LapsPerSeasonBarChart";
import { Top10Table } from "./charts/Top10Table";
import { SeasonHeatmap } from "./charts/SeasonHeatmap";
import { BestSeasonTile } from "./BestSeasonTile";
import { MaxLapsInSessionTile } from "./MaxLapsInSessionTile";
import { MaxLapsInOneHourTile } from "./MaxLapsInOneHourTile";
import { Best5Tile } from "./Best5Tile";
import { ChartSkeleton, TableSkeleton, HeatmapSkeleton } from "@/components/ChartSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { SchaatsLap } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ChartTabsProps {
  laps: SchaatsLap[];
  /** Volledige dataset voor seizoensdropdown (zonder lap-range filter) */
  allLapsForSeasons?: SchaatsLap[];
  /** Beste seizoentijd voor records-tab tegeltje */
  bestLapSeason?: number | null;
  /** Snelheid bij beste seizoentijd (km/h) */
  bestLapSeasonSpeed?: number | null;
  /** Datum van beste seizoentijd */
  bestLapSeasonDate?: string | null;
  /** Snelste totale tijd over 5 opeenvolgende ronden (s) */
  best5TotalTime?: number | null;
  /** Gem. snelheid van die 5 ronden (km/h) */
  best5AvgSpeed?: number | null;
  /** Datum van beste 5 ronden */
  best5Date?: string | null;
  /** Meest ronden in een sessie voor records-tab tegeltje */
  maxLapsInSession?: number;
  /** Datum van meeste ronden in sessie */
  maxLapsInSessionDate?: string | null;
  /** Meeste ronden in 1 uur voor records-tab tegeltje */
  maxLapsInOneHour?: number;
  /** Gem. snelheid bij meeste ronden in 1 uur (km/h) */
  maxLapsInOneHourAvgSpeed?: number | null;
  /** Datum van meeste ronden in 1 uur */
  maxLapsInOneHourDate?: string | null;
  isLoading?: boolean;
  /** Alleen grafieken tonen (geen Records/Seizoenen tabs) – voor mobiele Grafieken-tab */
  chartsOnly?: boolean;
  className?: string;
}

function ChartTabsInner({ laps, allLapsForSeasons = laps, bestLapSeason = null, bestLapSeasonSpeed = null, bestLapSeasonDate = null, best5TotalTime = null, best5AvgSpeed = null, best5Date = null, maxLapsInSession = 0, maxLapsInSessionDate = null, maxLapsInOneHour = 0, maxLapsInOneHourAvgSpeed = null, maxLapsInOneHourDate = null, isLoading, chartsOnly = false, className }: ChartTabsProps) {
  const grafiekenContent = (
    <div className="space-y-6">
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <LapTimeLineChart laps={laps} />}
      </ErrorBoundary>
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <SpeedLineChart laps={laps} />}
      </ErrorBoundary>
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <LapsPerSeasonBarChart laps={allLapsForSeasons} />}
      </ErrorBoundary>
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <ProgressChart laps={allLapsForSeasons} />}
      </ErrorBoundary>
    </div>
  );

  if (chartsOnly) {
    return (
      <div className={cn("w-full", className)}>
        {grafiekenContent}
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="grafieken"
      className={cn("w-full", className)}
      aria-label="Grafiek tabs"
    >
      <TabsList
        className="flex h-auto flex-wrap gap-1 rounded-lg bg-muted/50 p-1 sm:p-1.5 w-full sm:w-auto justify-start overflow-x-auto sm:overflow-visible"
        role="tablist"
        aria-label="Selecteer grafiek"
      >
        <TabsTrigger
          value="grafieken"
          className="rounded-md px-3 py-2.5 text-xs sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 shrink-0 touch-manipulation"
          role="tab"
          aria-selected="false"
        >
          Grafieken
        </TabsTrigger>
        <TabsTrigger
          value="records"
          className="rounded-md px-3 py-2.5 text-xs sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 shrink-0 touch-manipulation"
          role="tab"
        >
          Records
        </TabsTrigger>
        <TabsTrigger
          value="seizoenen"
          className="rounded-md px-3 py-2.5 text-xs sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm min-h-[44px] sm:min-h-0 shrink-0 touch-manipulation"
          role="tab"
        >
          Seizoenen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grafieken" className="mt-3" role="tabpanel">
        {grafiekenContent}
      </TabsContent>

      <TabsContent value="records" className="mt-3 space-y-3 min-w-0" role="tabpanel">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <BestSeasonTile bestLapSeason={bestLapSeason} bestLapSeasonSpeed={bestLapSeasonSpeed} date={bestLapSeasonDate} />
          <Best5Tile totalTime={best5TotalTime} avgSpeed={best5AvgSpeed} date={best5Date} />
          <MaxLapsInSessionTile maxLaps={maxLapsInSession} date={maxLapsInSessionDate} />
          <MaxLapsInOneHourTile maxLaps={maxLapsInOneHour} avgSpeed={maxLapsInOneHourAvgSpeed} date={maxLapsInOneHourDate} />
        </div>
        <ErrorBoundary>
          {isLoading ? <TableSkeleton /> : <Top10Table laps={allLapsForSeasons} />}
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="seizoenen" className="mt-3" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <HeatmapSkeleton /> : <SeasonHeatmap laps={allLapsForSeasons} />}
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
}

export const ChartTabs = memo(ChartTabsInner);
