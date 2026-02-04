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
import { formatLapTime } from "@/lib/utils";

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
      <CardContent>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Ronde</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead>Snelheid</TableHead>
                <TableHead>Baan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laps.map((lap, i) => (
                <TableRow key={`${lap.datum}-${lap.lap_num}-${i}`}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>{formatLapTime(lap.lap_time)}</TableCell>
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
