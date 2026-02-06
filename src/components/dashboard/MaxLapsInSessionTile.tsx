import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDisplay } from "@/lib/utils";

interface MaxLapsInSessionTileProps {
  maxLaps: number;
  date?: string | null;
}

export function MaxLapsInSessionTile({ maxLaps, date }: MaxLapsInSessionTileProps) {
  return (
    <Card className="overflow-hidden p-3 min-h-0 transition-all active:scale-[0.98] sm:overflow-visible sm:p-4 sm:transition-all sm:duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-lg card-hover">
      <CardHeader className="space-y-0 pb-1.5 shrink-0 sm:pb-1">
        <CardTitle className="text-muted-foreground text-[12px] sm:text-sm font-medium">
          Meest ronden in 1 sessie
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 pt-0 sm:pb-3 sm:pt-0 flex flex-col gap-1">
        <p className="font-bold text-base tabular-nums sm:text-lg md:text-xl">
          {maxLaps === 0 ? "—" : maxLaps.toLocaleString()}
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
