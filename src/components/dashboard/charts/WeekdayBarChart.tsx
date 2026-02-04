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
import { getWeekdayData } from "@/lib/chart-utils";
import { formatLapTimeSeconds } from "@/lib/utils";

interface WeekdayBarChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function WeekdayBarChartInner({ laps }: WeekdayBarChartProps) {
  const data = getWeekdayData(laps);

  if (laps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekdagen</CardTitle>
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
        <CardTitle>Ronden per weekdag</CardTitle>
        <p className="text-muted-foreground text-sm">
          Aantal ronden en gemiddelde lap tijd per weekdag
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="h-[240px] sm:h-[280px] md:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="weekday" tick={{ fontSize: 10 }} className="text-[10px] sm:text-xs" />
              <YAxis tick={{ fontSize: 10 }} className="text-[10px] sm:text-xs" />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">{payload[0].payload.weekday}</p>
                      <p className="text-muted-foreground">
                        Ronden: <span className="text-foreground font-medium">{payload[0].payload.laps}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Gem. lap tijd: <span className="text-foreground font-medium">{formatLapTimeSeconds(payload[0].payload.avgTime)} s</span>
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="laps"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
                name="Ronden"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const WeekdayBarChart = memo(WeekdayBarChartInner);
