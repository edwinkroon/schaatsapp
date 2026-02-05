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
          <Table className="text-[14px] sm:text-sm min-w-[320px] sm:min-w-0 table-fixed w-full [&_th]:text-[16px] [&_th]:h-7 [&_th]:py-1 sm:[&_th]:h-10 sm:[&_th]:py-2 [&_td]:py-1.5 sm:[&_td]:py-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5 text-right">Ronde</TableHead>
                <TableHead className="w-1/5 text-right">Tijd</TableHead>
                <TableHead className="w-1/5 text-right">Snelheid</TableHead>
                <TableHead className="text-right">Tijdsverschil</TableHead>
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
                    {Math.abs(diff).toFixed(2)} s
                  </span>
                ) : "—";
                const isFastest = i === fastestIndex;
                return (
                  <TableRow
                    key={`${lap.datum}-${lap.lap_num}-${i}`}
                    className={isFastest ? "bg-emerald-50/70 dark:bg-violet-950/50 font-semibold" : undefined}
                  >
                    <TableCell className="text-right font-medium tabular-nums">{i + 1}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatLapTimeSeconds(lap.lap_time)} s</TableCell>
                    <TableCell className="text-right tabular-nums">{lap.snelheid.toFixed(1)} km/h</TableCell>
                    <TableCell className="text-right">{diffContent}</TableCell>
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
