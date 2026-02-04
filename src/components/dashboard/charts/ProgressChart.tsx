import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchaatsLap } from "@/lib/data";
import { formatLapTimeSeconds } from "@/lib/utils";
import { getProgressData } from "@/lib/chart-utils";

interface ProgressChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function ProgressChartInner({ laps }: ProgressChartProps) {
  const data = getProgressData(laps);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progressie</CardTitle>
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
        <CardTitle>Progressie – beste lap per week</CardTitle>
        <p className="text-muted-foreground text-sm">
          Je snelste ronde per week. Dalende lijn = verbetering.
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="h-[220px] sm:h-[280px] md:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
                tickFormatter={(v) => `${formatLapTimeSeconds(v)} s`}
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">{payload[0].payload.week}</p>
                      <p className="text-muted-foreground">
                        Beste lap: <span className="text-foreground font-medium">{formatLapTimeSeconds(payload[0].payload.bestTime)} s</span>
                      </p>
                    </div>
                  ) : null
                }
              />
              <Line
                type="monotone"
                dataKey="bestTime"
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Beste tijd"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const ProgressChart = memo(ProgressChartInner);
