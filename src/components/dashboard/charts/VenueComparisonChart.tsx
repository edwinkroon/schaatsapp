import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchaatsLap } from "@/lib/data";
import { getVenueComparisonData } from "@/lib/chart-utils";
import { formatLapTimeSeconds } from "@/lib/utils";

interface VenueComparisonChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function VenueComparisonChartInner({ laps }: VenueComparisonChartProps) {
  const data = getVenueComparisonData(laps);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IJsbanen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            Geen data. Laad data via de sidebar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergelijking ijsbanen</CardTitle>
        <p className="text-muted-foreground text-sm">
          Ronden, gem. lap tijd en snelheid per baan
        </p>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-0 sm:px-4 sm:pt-4 md:px-5 md:pt-5">
        <div className="h-[240px] sm:h-[280px] md:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="baan" tick={{ fontSize: 9 }} className="text-[9px] sm:text-xs" angle={-35} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 10 }} className="text-[10px] sm:text-xs" />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">{payload[0].payload.baan}</p>
                      <p className="text-muted-foreground">
                        Ronden: <span className="text-foreground font-medium">{payload[0].payload.laps}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Gem. lap tijd: <span className="text-foreground font-medium">{formatLapTimeSeconds(payload[0].payload.avgLapTime)} s</span>
                      </p>
                      <p className="text-muted-foreground">
                        Gem. snelheid: <span className="text-foreground font-medium">{payload[0].payload.avgSnelheid} km/h</span>
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="laps" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Ronden" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const VenueComparisonChart = memo(VenueComparisonChartInner);
