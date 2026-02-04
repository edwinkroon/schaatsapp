import { Activity, Award, Gauge, GaugeCircle, MapPin, Trophy } from "lucide-react";
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
  {
    key: "laps",
    icon: Activity,
    title: "Ronden",
    value: (v: number) => v.toLocaleString(),
    suffix: "",
    iconClass: "text-blue-500 dark:text-blue-400",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    key: "best",
    icon: Trophy,
    title: "Beste ronde",
    value: (v: number) => formatLapTimeSeconds(v),
    suffix: " s",
    iconClass: "text-amber-500 dark:text-amber-400",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
  },
  {
    key: "bestSeason",
    icon: Award,
    title: "Beste dit seizoen",
    value: (v: number) => formatLapTimeSeconds(v),
    suffix: " s",
    iconClass: "text-orange-500 dark:text-orange-400",
    bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
  },
  {
    key: "speed",
    icon: Gauge,
    title: "Gem. snelheid",
    value: (v: number) => v.toFixed(1),
    suffix: " km/h",
    iconClass: "text-emerald-500 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    key: "maxSpeed",
    icon: GaugeCircle,
    title: "Hoogste snelheid",
    value: (v: number) => v.toFixed(1),
    suffix: " km/h",
    iconClass: "text-cyan-500 dark:text-cyan-400",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/20",
  },
  {
    key: "distance",
    icon: MapPin,
    title: "Afstand",
    value: (v: number) => v.toFixed(1),
    suffix: " km",
    iconClass: "text-violet-500 dark:text-violet-400",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/20",
  },
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
        "grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
        className
      )}
    >
      {cards.map(({ key, icon: Icon, title, value, suffix, iconClass, bgClass }) => (
        <Card
          key={key}
          className={cn(
            "overflow-hidden border-0 shadow-md transition-all duration-200 min-w-0",
            "hover:shadow-lg hover:-translate-y-0.5",
            "dark:shadow-none dark:bg-card/80"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {title}
            </CardTitle>
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg",
                bgClass
              )}
            >
              <Icon className={cn("size-4", iconClass)} />
            </div>
          </CardHeader>
          <CardContent className="pb-2 pt-0 sm:pb-6 sm:pt-0">
            <p className={cn(
              "text-lg sm:text-xl md:text-2xl font-bold tracking-tight break-words",
              (key === "best" || key === "bestSeason") && "text-right tabular-nums"
            )}>
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
