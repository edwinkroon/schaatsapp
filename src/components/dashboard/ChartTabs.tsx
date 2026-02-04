import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LapTimeLineChart } from "./charts/LapTimeLineChart";
import { Top10Table } from "./charts/Top10Table";
import { SeasonHeatmap } from "./charts/SeasonHeatmap";
import { WeekdayBarChart } from "./charts/WeekdayBarChart";
import { VenueComparisonChart } from "./charts/VenueComparisonChart";
import { ChartSkeleton, TableSkeleton, HeatmapSkeleton } from "@/components/ChartSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { SchaatsLap } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ChartTabsProps {
  laps: SchaatsLap[];
  /** Volledige dataset voor seizoensdropdown (zonder lap-range filter) */
  allLapsForSeasons?: SchaatsLap[];
  isLoading?: boolean;
  className?: string;
}

function ChartTabsInner({ laps, allLapsForSeasons = laps, isLoading, className }: ChartTabsProps) {
  return (
    <Tabs
      defaultValue="grafieken"
      className={cn("w-full", className)}
      aria-label="Grafiek tabs"
    >
      <TabsList
        className="flex h-auto flex-wrap gap-1.5 rounded-xl bg-muted/60 p-1.5"
        role="tablist"
        aria-label="Selecteer grafiek"
      >
        <TabsTrigger
          value="grafieken"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          role="tab"
          aria-selected="false"
        >
          Grafieken
        </TabsTrigger>
        <TabsTrigger
          value="records"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          role="tab"
        >
          Persoonlijke records
        </TabsTrigger>
        <TabsTrigger
          value="seizoenen"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          role="tab"
        >
          Seizoenen
        </TabsTrigger>
        <TabsTrigger
          value="weekdagen"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          role="tab"
        >
          Weekdagen
        </TabsTrigger>
        <TabsTrigger
          value="ijsbanen"
          className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          role="tab"
        >
          IJsbanen
        </TabsTrigger>
      </TabsList>

      <TabsContent value="grafieken" className="mt-4" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <ChartSkeleton /> : <LapTimeLineChart laps={laps} />}
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="records" className="mt-4" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <TableSkeleton /> : <Top10Table laps={allLapsForSeasons} />}
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="seizoenen" className="mt-4" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <HeatmapSkeleton /> : <SeasonHeatmap laps={allLapsForSeasons} />}
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="weekdagen" className="mt-4" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <ChartSkeleton /> : <WeekdayBarChart laps={laps} />}
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="ijsbanen" className="mt-4" role="tabpanel">
        <ErrorBoundary>
          {isLoading ? <ChartSkeleton /> : <VenueComparisonChart laps={laps} />}
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
}

export const ChartTabs = memo(ChartTabsInner);
