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
import { formatDateDisplay } from "@/lib/utils";
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
    <Card>
      <CardHeader>
        <CardTitle>Top 10 persoonlijke records</CardTitle>
        <p className="text-muted-foreground text-sm">
          Snelste rondes op lap tijd (laagste = beste)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Lap tijd (s)</TableHead>
                <TableHead>Snelheid (km/h)</TableHead>
                <TableHead>Baan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top10.map((row) => (
                <TableRow key={row.rank}>
                  <TableCell className="font-medium">{row.rank}</TableCell>
                  <TableCell>{formatDateDisplay(row.datum)}</TableCell>
                  <TableCell>{row.lap_time}</TableCell>
                  <TableCell>{row.snelheid}</TableCell>
                  <TableCell>{row.baan}</TableCell>
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
