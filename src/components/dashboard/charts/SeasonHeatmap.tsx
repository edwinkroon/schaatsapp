import { memo, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSeasonFromDate, type SchaatsLap } from "@/lib/data";
import { cn, formatDateDisplay } from "@/lib/utils";
import { getSeasonHeatmapData } from "@/lib/chart-utils";

const LAP_DISTANCE_KM = 0.4;

interface SeasonHeatmapProps {
  laps: SchaatsLap[];
}

function SeasonHeatmapInner({ laps }: SeasonHeatmapProps) {
  const seasonStats = useMemo(() => {
    const bySeason = new Map<string, number>();
    for (const lap of laps) {
      const season = getSeasonFromDate(lap.datum ?? "");
      if (!season) continue;
      bySeason.set(season, (bySeason.get(season) ?? 0) + 1);
    }
    return Array.from(bySeason.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([season, count]) => ({
        season,
        year: parseInt(season.slice(0, 4), 10),
        laps: count,
        km: Math.round(count * LAP_DISTANCE_KM * 10) / 10,
      }));
  }, [laps]);

  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  useEffect(() => {
    if (seasonStats.length > 0) {
      setSelectedSeason((prev) =>
        prev && seasonStats.some((s) => s.season === prev)
          ? prev
          : seasonStats[0]?.season ?? null
      );
    } else {
      setSelectedSeason(null);
    }
  }, [seasonStats]);

  const lapsForSeason = useMemo(() => {
    if (!selectedSeason) return [];
    return laps.filter((l) => getSeasonFromDate(l.datum ?? "") === selectedSeason);
  }, [laps, selectedSeason]);

  const heatmapData = useMemo(
    () => getSeasonHeatmapData(lapsForSeason),
    [lapsForSeason]
  );

  const { cells } = useMemo(() => {
    if (heatmapData.length === 0)
      return { cells: [] as { date: string; laps: number; intensity: number }[] };

    const byDate = new Map<string, { laps: number; intensity: number }>();
    for (const { datum, laps: count, intensity } of heatmapData) {
      byDate.set(datum, { laps: count, intensity });
    }

    const dates = heatmapData.map((d) => d.datum).sort();
    const min = dates[0] ?? "";
    const max = dates[dates.length - 1] ?? "";

    const start = new Date(min + "T12:00:00");
    const end = new Date(max + "T12:00:00");
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    const cells: { date: string; laps: number; intensity: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const cell = byDate.get(dateStr) ?? { laps: 0, intensity: 0 };
      cells.push({ date: dateStr, laps: cell.laps, intensity: cell.intensity });
    }

    return { cells };
  }, [heatmapData]);

  if (seasonStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seizoensoverzicht</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            Geen data. Laad data via de sidebar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxLaps = cells.length > 0 ? Math.max(1, ...cells.map((c) => c.laps)) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {seasonStats.map(({ season, laps: count, km }) => (
          <Card
            key={season}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedSeason(season)}
            onKeyDown={(e) =>
              e.key === "Enter" && setSelectedSeason(season)
            }
            className={cn(
              "overflow-hidden p-3 transition-all cursor-pointer active:scale-[0.98] sm:p-4 sm:hover:-translate-y-0.5 sm:hover:shadow-lg card-hover",
              selectedSeason === season &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <CardHeader className="space-y-0 pb-1 shrink-0">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {season}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5 pt-0">
              <p className="font-bold text-base tabular-nums sm:text-lg">
                {count.toLocaleString()} ronden
              </p>
              <p className="text-muted-foreground text-sm tabular-nums">
                {km.toFixed(1)} km
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {cells.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ronden per dag ({selectedSeason})</CardTitle>
              <p className="text-muted-foreground text-sm">
                Donkerder = meer ronden (max {maxLaps}).
              </p>
            </div>
            {seasonStats.length > 1 && (
              <Select
                value={selectedSeason ?? ""}
                onValueChange={(v) => setSelectedSeason(v)}
                aria-label="Selecteer seizoen"
              >
                <SelectTrigger className="w-full sm:w-[140px] shrink-0">
                  <SelectValue placeholder="Seizoen" />
                </SelectTrigger>
                <SelectContent>
                  {seasonStats.map(({ season }) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-0 sm:px-4 sm:pt-4 md:px-5 md:pt-5">
            <TooltipProvider>
              <div className="flex flex-wrap gap-0.5 sm:gap-1">
                {cells.map((cell) => {
                  const opacity = 0.2 + cell.intensity * 0.8;
                  return (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger asChild>
                        <div
                          className="h-4 sm:h-5 md:h-6 min-w-[8px] sm:min-w-[10px] md:min-w-[12px] flex-1 rounded-sm transition-opacity hover:opacity-80"
                          style={{
                            backgroundColor: `oklch(0.6 0.2 250 / ${opacity})`,
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{formatDateDisplay(cell.date)}</p>
                        <p className="text-muted-foreground">
                          {cell.laps} {cell.laps === 1 ? "ronde" : "ronden"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const SeasonHeatmap = memo(SeasonHeatmapInner);
