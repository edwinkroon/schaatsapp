import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatLapTimeSeconds } from "@/lib/utils";

interface StatsCardsProps {
  totalLaps: number;
  bestLap: number | null;
  bestLapSeason: number | null;
  avgSpeed: number;
  maxSpeed: number;
  totalDistance: number;
  className?: string;
}

const cards = [
  { key: "laps", title: "Ronden", value: (v: number) => v.toLocaleString(), suffix: "" },
  { key: "best", title: "Beste ronde", value: (v: number) => formatLapTimeSeconds(v), suffix: " s" },
  { key: "bestSeason", title: "Beste dit seizoen", value: (v: number) => formatLapTimeSeconds(v), suffix: " s" },
  { key: "speed", title: "Gem. snelheid", value: (v: number) => v.toFixed(1), suffix: " km/h" },
  { key: "maxSpeed", title: "Hoogste snelheid", value: (v: number) => v.toFixed(1), suffix: " km/h" },
  { key: "distance", title: "Afstand", value: (v: number) => v.toFixed(1), suffix: " km" },
] as const;

export function StatsCards({
  totalLaps,
  bestLap,
  bestLapSeason,
  avgSpeed,
  maxSpeed,
  totalDistance,
  className,
}: StatsCardsProps) {
  const values = {
    laps: totalLaps,
    best: bestLap ?? 0,
    bestSeason: bestLapSeason ?? 0,
    speed: avgSpeed,
    maxSpeed,
    distance: totalDistance,
  };

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      {cards.map(({ key, title, value, suffix }) => (
        <Card
          key={key}
          className={cn(
            "overflow-hidden border-0 shadow-sm transition-all duration-200 min-w-0",
            "hover:shadow-md hover:-translate-y-0.5",
            "dark:shadow-none dark:bg-card/80"
          )}
        >
          <CardHeader className="space-y-0 pb-1.5">
            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-1.5 pt-0 sm:pb-4 sm:pt-0">
            <p className="text-base font-bold tracking-tight break-words tabular-nums text-left sm:text-lg md:text-xl">
              {key === "best" && bestLap === null
                ? "—"
                : key === "bestSeason" && bestLapSeason === null
                  ? "—"
                  : `${value(values[key])}${suffix}`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
