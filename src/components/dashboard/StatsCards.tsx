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
  { key: "laps", title: "Ronden", value: (v: number) => v.toLocaleString() },
  { key: "best", title: "Beste ronde (s)", value: (v: number) => formatLapTimeSeconds(v) },
  { key: "bestSeason", title: "Beste dit seizoen (s)", value: (v: number) => formatLapTimeSeconds(v) },
  { key: "speed", title: "Gem. snelheid (km/h)", value: (v: number) => v.toFixed(1) },
  { key: "maxSpeed", title: "Hoogste snelheid (km/h)", value: (v: number) => v.toFixed(1) },
  { key: "distance", title: "Afstand (km)", value: (v: number) => v.toFixed(1) },
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
    <div className={className}>
      {/* Mobile: single card with rows and dividers */}
      <Card className="sm:hidden">
        <CardContent className="p-0">
          {cards.map(({ key, title, value }, i) => (
            <div
              key={key}
              className={cn(
                "flex items-center justify-between px-4 py-3",
                i > 0 && "border-t border-border/30"
              )}
            >
              <span className="text-muted-foreground text-sm font-medium">
                {title}
              </span>
              <span className="font-bold tabular-nums">
                {key === "best" && bestLap === null
                  ? "—"
                  : key === "bestSeason" && bestLapSeason === null
                    ? "—"
                    : value(values[key])}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Desktop: grid of individual cards */}
      <div className="hidden sm:grid grid-cols-2 gap-2.5 md:gap-3 md:grid-cols-3 lg:grid-cols-6 items-stretch">
        {cards.map(({ key, title, value }) => (
          <Card
            key={key}
            className={cn(
              "overflow-hidden transition-all duration-200 min-w-0 h-full flex flex-col py-2 sm:py-3 md:py-3",
              "hover:-translate-y-0.5 hover:shadow-lg",
              "card-hover"
            )}
          >
            <CardHeader className="space-y-0 pb-1.5 shrink-0">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-1 pt-0 sm:pb-3 sm:pt-0 flex-1 flex items-end min-h-0">
              <p className="text-base font-bold tracking-tight break-words tabular-nums text-left sm:text-lg md:text-xl w-full">
                {key === "best" && bestLap === null
                  ? "—"
                  : key === "bestSeason" && bestLapSeason === null
                    ? "—"
                    : value(values[key])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
