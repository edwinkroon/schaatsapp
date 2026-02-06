import { useState } from "react";
import { Calendar, RefreshCw } from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
} from "@/components/ui/sidebar";
import { nl } from "react-day-picker/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDateDisplay, dateToLocalDateString } from "@/lib/utils";
import { SchaatsLogo } from "./SchaatsLogo";

interface SidebarProps {
  transponder: string;
  onTransponderChange: (id: string) => void;
  selectedDate: string;
  availableDays: string[];
  lapsPerDate: Map<string, number>;
  onDateChange: (date: string) => void;
  loading: boolean;
  hasData: boolean;
  onRefresh?: () => void;
}

export function Sidebar({
  transponder,
  onTransponderChange,
  selectedDate,
  availableDays,
  lapsPerDate,
  onDateChange,
  loading,
  hasData,
  onRefresh,
}: SidebarProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <SidebarPrimitive
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar/95 pt-2">
        <div className="flex h-[31px] items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl text-sidebar-foreground">
            <SchaatsLogo />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">Schaatsapp</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-4 px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Transponder</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex gap-2">
              <SidebarInput
                placeholder="FZ-62579"
                value={transponder}
                onChange={(e) => onTransponderChange(e.target.value)}
                className="transition-colors hover:bg-accent/50 dark:hover:bg-accent/20"
                aria-label="Transponder-ID"
              />
              {onRefresh && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onRefresh}
                  disabled={loading}
                  aria-label="Data vernieuwen"
                  className="shrink-0"
                >
                  <RefreshCw
                    className={cn("size-4", loading && "animate-spin")}
                    aria-hidden
                  />
                </Button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dag</SidebarGroupLabel>
          <SidebarGroupContent>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-colors hover:bg-accent/50 dark:hover:bg-accent/20",
                    !selectedDate && "text-muted-foreground"
                  )}
                  disabled={!hasData}
                  aria-label="Selecteer dag"
                >
                  <Calendar className="mr-2 size-4 shrink-0" aria-hidden />
                  {selectedDate ? (
                    <span className="flex flex-col items-start">
                      <span>{formatDateDisplay(selectedDate)}</span>
                      {lapsPerDate.get(selectedDate) && (
                        <span className="text-muted-foreground text-xs">
                          {lapsPerDate.get(selectedDate)} ronden
                        </span>
                      )}
                    </span>
                  ) : (
                    "Laad data om datum te kiezen"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={
                    selectedDate
                      ? new Date(selectedDate + "T12:00:00")
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const dateStr = dateToLocalDateString(date);
                      if (availableDays.includes(dateStr)) {
                        onDateChange(dateStr);
                        setDatePickerOpen(false);
                      }
                    }
                  }}
                  disabled={(date) => {
                    const dateStr = dateToLocalDateString(date);
                    return !availableDays.includes(dateStr);
                  }}
                  modifiers={{
                    hasData: availableDays.map(
                      (d) => new Date(d + "T12:00:00")
                    ),
                  }}
                  modifiersClassNames={{
                    hasData:
                      "relative after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                  }}
                  defaultMonth={
                    availableDays.length > 0
                      ? new Date(availableDays[0] + "T12:00:00")
                      : undefined
                  }
                  locale={nl}
                />
                <p className="text-muted-foreground border-t px-3 py-2 text-xs">
                  Dagen met een puntje hebben data. Klik om te selecteren.
                </p>
              </PopoverContent>
            </Popover>
          </SidebarGroupContent>
        </SidebarGroup>

        {loading && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">
              Data laden...
            </SidebarGroupLabel>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <p className="text-muted-foreground px-2 text-xs">
          Transponder: {transponder || "—"}
        </p>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}
