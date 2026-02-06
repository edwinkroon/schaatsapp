import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLapTimeSeconds, formatDateDisplay } from "@/lib/utils";

interface BestSeasonTileProps {
  bestLapSeason: number | null;
  bestLapSeasonSpeed?: number | null;
  date?: string | null;
}

export function BestSeasonTile({ bestLapSeason, bestLapSeasonSpeed, date }: BestSeasonTileProps) {
  return (
    <Card className="overflow-hidden p-3 min-h-0 transition-all active:scale-[0.98] sm:overflow-visible sm:p-4 sm:transition-all sm:duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-lg card-hover">
      <CardHeader className="space-y-0 pb-1.5 shrink-0 sm:pb-1">
        <CardTitle className="text-muted-foreground text-[12px] sm:text-sm font-medium">
          Beste seizoentijd
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 pt-0 sm:pb-3 sm:pt-0 flex flex-col gap-1">
        <p className="font-bold text-base tabular-nums sm:text-lg md:text-xl">
          {bestLapSeason === null ? "—" : formatLapTimeSeconds(bestLapSeason)}
          {bestLapSeason !== null && bestLapSeasonSpeed != null && (
            <span className="text-muted-foreground font-normal text-xs sm:text-sm ml-1">
              ({bestLapSeasonSpeed} km/h)
            </span>
          )}
        </p>
        {date && (
          <p className="text-muted-foreground text-xs sm:text-sm italic">
            {formatDateDisplay(date)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
