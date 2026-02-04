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
import type { SchaatsLap } from "@/lib/data";
import { formatDateDisplay } from "@/lib/utils";
import { getSeasonHeatmapData } from "@/lib/chart-utils";

interface SeasonHeatmapProps {
  laps: SchaatsLap[];
}

function SeasonHeatmapInner({ laps }: SeasonHeatmapProps) {
  const availableSeasons = useMemo(() => {
    const years = new Set<number>();
    for (const lap of laps) {
      const year = parseInt(lap.datum?.slice(0, 4) ?? "0", 10);
      if (year > 2000 && year < 2100) years.add(year);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [laps]);

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  useEffect(() => {
    if (availableSeasons.length > 0) {
      setSelectedSeason((prev) =>
        prev !== null && availableSeasons.includes(prev)
          ? prev
          : availableSeasons[0] ?? null
      );
    } else {
      setSelectedSeason(null);
    }
  }, [availableSeasons]);

  const lapsForSeason = useMemo(() => {
    if (!selectedSeason) return [];
    return laps.filter((l) => {
      const y = parseInt(l.datum?.slice(0, 4) ?? "0", 10);
      return y === selectedSeason;
    });
  }, [laps, selectedSeason]);

  const heatmapData = useMemo(
    () => getSeasonHeatmapData(lapsForSeason),
    [lapsForSeason]
  );

  const { cells } = useMemo(() => {
    if (heatmapData.length === 0)
      return { cells: [] as { date: string; laps: number; intensity: number }[], minDate: "", maxDate: "" };

    const byDate = new Map<string, { laps: number; intensity: number }>();
    for (const { datum, laps: count, intensity } of heatmapData) {
      byDate.set(datum, { laps: count, intensity });
    }

    const dates = heatmapData.map((d) => d.datum).sort();
    const min = dates[0] ?? "";
    const max = dates[dates.length - 1] ?? "";

    const start = new Date(min + "T12:00:00");
    const end = new Date(max + "T12:00:00");
    const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

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

  if (cells.length === 0) {
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

  const maxLaps = Math.max(1, ...cells.map((c) => c.laps));

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Seizoensoverzicht</CardTitle>
          <p className="text-muted-foreground text-sm">
            Aantal ronden per dag. Donkerder = meer ronden (max {maxLaps}).
          </p>
        </div>
        {availableSeasons.length >= 1 && (
          <Select
            value={selectedSeason?.toString() ?? ""}
            onValueChange={(v) => setSelectedSeason(parseInt(v, 10))}
            aria-label="Selecteer seizoen"
          >
            <SelectTrigger className="w-full sm:w-[140px] shrink-0">
              <SelectValue placeholder="Seizoen" />
            </SelectTrigger>
            <SelectContent>
              {availableSeasons.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}–{year + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
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
  );
}

export const SeasonHeatmap = memo(SeasonHeatmapInner);
