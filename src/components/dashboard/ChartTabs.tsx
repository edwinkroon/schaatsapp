import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LapTimeLineChart } from "./charts/LapTimeLineChart";
import { SpeedLineChart } from "./charts/SpeedLineChart";
import { ProgressChart } from "./charts/ProgressChart";
import { Top10Table } from "./charts/Top10Table";
import { SeasonHeatmap } from "./charts/SeasonHeatmap";
import { ChartSkeleton, TableSkeleton, HeatmapSkeleton } from "@/components/ChartSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { SchaatsLap } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ChartTabsProps {
  laps: SchaatsLap[];
  /** Volledige dataset voor seizoensdropdown (zonder lap-range filter) */
  allLapsForSeasons?: SchaatsLap[];
  isLoading?: boolean;
  /** Alleen grafieken tonen (geen Records/Seizoenen tabs) – voor mobiele Grafieken-tab */
  chartsOnly?: boolean;
  className?: string;
}

function ChartTabsInner({ laps, allLapsForSeasons = laps, isLoading, chartsOnly = false, className }: ChartTabsProps) {
  const grafiekenContent = (
    <div className="space-y-6">
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <LapTimeLineChart laps={laps} />}
      </ErrorBoundary>
      <ErrorBoundary>
        {isLoading ? <ChartSkeleton /> : <SpeedLineChart laps={laps} />}
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

      <TabsContent value="records" className="mt-3" role="tabpanel">
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
