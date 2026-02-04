import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { nl } from "react-day-picker/locale";
import { cn, formatDateDisplay, dateToLocalDateString } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: string;
  availableDays: string[];
  lapsPerDate: Map<string, number>;
  onDateChange: (date: string) => void;
  hasData: boolean;
  className?: string;
}

export function DateSelector({
  selectedDate,
  availableDays,
  lapsPerDate,
  onDateChange,
  hasData,
  className,
}: DateSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
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
            selectedDate ? new Date(selectedDate + "T12:00:00") : undefined
          }
          onSelect={(date) => {
            if (date) {
              const dateStr = dateToLocalDateString(date);
              if (availableDays.includes(dateStr)) {
                onDateChange(dateStr);
                setOpen(false);
              }
            }
          }}
          disabled={(date) => {
            const dateStr = dateToLocalDateString(date);
            return !availableDays.includes(dateStr);
          }}
          modifiers={{
            hasData: availableDays.map((d) => new Date(d + "T12:00:00")),
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
  );
}
