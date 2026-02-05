import { memo, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchaatsLap } from "@/lib/data";
import { formatLapTimeSeconds, formatDateWithWeekday } from "@/lib/utils";

interface LapTimesListProps {
  laps: SchaatsLap[];
}

function LapTimesListInner({ laps }: LapTimesListProps) {
  const fastestIndex = useMemo(() => {
    if (laps.length === 0) return -1;
    let min = laps[0].lap_time;
    let idx = 0;
    laps.forEach((lap, i) => {
      if (lap.lap_time < min) {
        min = lap.lap_time;
        idx = i;
      }
    });
    return idx;
  }, [laps]);

  if (laps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Rondetijden{laps[0]?.datum ? ` – ${formatDateWithWeekday(laps[0].datum)}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="overflow-x-auto max-h-none sm:max-h-[800px] overflow-y-visible sm:overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0 overscroll-y-auto">
          <Table className="text-[14px] sm:text-sm min-w-[320px] sm:min-w-0 table-fixed w-full [&_th]:text-[14px] [&_th]:h-7 [&_th]:py-1 [&_th]:align-top sm:[&_th]:h-10 sm:[&_th]:py-2 [&_td]:py-1.5 sm:[&_td]:py-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5 text-center">Ronde</TableHead>
                <TableHead className="w-1/5 text-center">Tijd</TableHead>
                <TableHead className="w-1/5 text-center">
                  <span className="block">Snelheid</span>
                  <span className="block text-sm sm:text-base font-normal text-muted-foreground">(km/h)</span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="block">Tijdsverschil</span>
                  <span className="block text-sm sm:text-base font-normal text-muted-foreground">(in seconden)</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laps.map((lap, i) => {
                const prevLapTime = i > 0 ? laps[i - 1].lap_time : null;
                const diff = prevLapTime !== null ? lap.lap_time - prevLapTime : null;
                const arrow = diff !== null ? (diff > 0 ? "↑" : diff < 0 ? "↓" : "") : "";
                const arrowClass = diff !== null ? (diff > 0 ? "text-green-600 dark:text-green-500" : diff < 0 ? "text-red-600 dark:text-red-500" : "") : "";
                const diffContent = diff !== null ? (
                  <span className="tabular-nums">
                    {arrow && <span className={arrowClass}>{arrow} </span>}
                    {Math.abs(diff).toFixed(2)}
                  </span>
                ) : "—";
                const isFastest = i === fastestIndex;
                return (
                  <TableRow
                    key={`${lap.datum}-${lap.lap_num}-${i}`}
                    className={isFastest ? "bg-sky-100/60 dark:bg-violet-900/40 font-black" : undefined}
                  >
                    <TableCell className="text-center font-medium tabular-nums">{i + 1}</TableCell>
                    <TableCell className="text-center tabular-nums">{formatLapTimeSeconds(lap.lap_time)}</TableCell>
                    <TableCell className="text-center tabular-nums">{lap.snelheid.toFixed(1)}</TableCell>
                    <TableCell className="text-center">{diffContent}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export const LapTimesList = memo(LapTimesListInner);
