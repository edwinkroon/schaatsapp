import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLapTimeSeconds, formatDateDisplay } from "@/lib/utils";

interface Best5TileProps {
  totalTime: number | null | undefined;
  date?: string | null;
}

export function Best5Tile({ totalTime, date }: Best5TileProps) {
  const time = totalTime ?? null;
  return (
    <Card className="overflow-hidden p-3 min-h-0 transition-all active:scale-[0.98] sm:overflow-visible sm:p-4 sm:transition-all sm:duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-lg card-hover">
      <CardHeader className="space-y-0 pb-1.5 shrink-0 sm:pb-1">
        <CardTitle className="text-muted-foreground text-[12px] sm:text-sm font-medium">
          Beste 5 ronden
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0 pt-0 sm:pb-3 sm:pt-0 flex flex-col gap-1">
        <p className="font-bold text-base tabular-nums sm:text-lg md:text-xl">
          {time === null ? "—" : formatLapTimeSeconds(time)}
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
