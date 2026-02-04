import { memo } from "react";
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
import { formatLapTimeSeconds } from "@/lib/utils";

interface LapTimesListProps {
  laps: SchaatsLap[];
}

function LapTimesListInner({ laps }: LapTimesListProps) {
  if (laps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rondetijden</CardTitle>
        <p className="text-muted-foreground text-sm">
          Alle ronden van de geselecteerde dag
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="overflow-x-auto max-h-[280px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <Table className="text-xs sm:text-sm min-w-[320px] sm:min-w-0 table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Ronde</TableHead>
                <TableHead className="w-1/4 text-right">Tijd</TableHead>
                <TableHead className="w-1/4">Snelheid</TableHead>
                <TableHead className="w-1/4">Baan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laps.map((lap, i) => (
                <TableRow key={`${lap.datum}-${lap.lap_num}-${i}`}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatLapTimeSeconds(lap.lap_time)} s</TableCell>
                  <TableCell>{lap.snelheid.toFixed(1)} km/h</TableCell>
                  <TableCell>{lap.baan || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export const LapTimesList = memo(LapTimesListInner);
