import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn, formatLapTimeSeconds } from "@/lib/utils";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  stats?: {
    totalLaps: number;
    avgLapTime: number;
    avgSnelheid: number;
  };
  sidebarTrigger?: React.ReactNode;
  className?: string;
}

export function Header({
  darkMode,
  onToggleDarkMode,
  stats,
  sidebarTrigger,
  className,
}: HeaderProps) {
  return (
    <header
      role="banner"
      className={cn(
        "header-glass flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 sm:px-4 md:px-6",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {sidebarTrigger}
      </div>
      <div className="flex items-center gap-4">
        {stats && stats.totalLaps > 0 && (
          <div className="hidden items-center gap-6 md:flex" role="status" aria-live="polite">
            <span className="text-muted-foreground rounded-full bg-muted/60 px-3 py-1 text-sm font-medium">
              {stats.totalLaps} Ronden
            </span>
            <span className="text-muted-foreground rounded-full bg-muted/60 px-3 py-1 text-sm font-medium">
              Ø {formatLapTimeSeconds(stats.avgLapTime)} s
            </span>
            <span className="text-muted-foreground rounded-full bg-muted/60 px-3 py-1 text-sm font-medium">
              Ø {stats.avgSnelheid} km/h
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Sun className="text-muted-foreground size-4" aria-hidden />
          <Switch
            checked={darkMode}
            onCheckedChange={onToggleDarkMode}
            aria-label="Donkere modus aan of uit"
          />
          <Moon className="text-muted-foreground size-4" aria-hidden />
        </div>
      </div>
    </header>
  );
}
