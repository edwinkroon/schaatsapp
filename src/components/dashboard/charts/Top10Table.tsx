import { memo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import type { SchaatsLap } from "@/lib/data";
import { formatDateDisplay, formatLapTimeSeconds } from "@/lib/utils";
import { getTop10Bests } from "@/lib/chart-utils";

interface Top10TableProps {
  laps: SchaatsLap[];
}

function Top10TableInner({ laps }: Top10TableProps) {
  const top10 = getTop10Bests(laps);

  if (top10.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persoonlijke records</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="Geen data"
            description="Laad data via de sidebar."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Top 10 persoonlijke records</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5 overflow-hidden min-w-0 w-full">
        <div className="min-w-0 w-full overflow-hidden">
          <Table className="w-full text-sm table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-right">#</TableHead>
                <TableHead className="text-right">Datum</TableHead>
                <TableHead className="text-right">Tijd (s)</TableHead>
                <TableHead className="text-right">Snelheid (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top10.map((row) => (
                <TableRow key={row.rank}>
                  <TableCell className="text-right font-medium tabular-nums">{row.rank}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatDateDisplay(row.datum)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatLapTimeSeconds(row.lap_time)}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.snelheid}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export const Top10Table = memo(Top10TableInner);
