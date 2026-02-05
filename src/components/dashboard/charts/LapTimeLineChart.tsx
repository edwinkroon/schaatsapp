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
import { formatDateDisplay, formatLapTimeSeconds } from "@/lib/utils";
import { getLapTimeChartData } from "@/lib/chart-utils";

interface LapTimeLineChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function LapTimeLineChartInner({ laps }: LapTimeLineChartProps) {
  const data = getLapTimeChartData(laps);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rondetijden</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            Geen data. Laad data via de sidebar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedDate = data.length > 0 && data[0].datum ? formatDateDisplay(data[0].datum) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rondetijden (s)</CardTitle>
        {selectedDate && (
          <p className="text-muted-foreground text-sm">{selectedDate}</p>
        )}
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-0 sm:px-4 sm:pt-4 md:px-5 md:pt-5">
        <div className="h-[220px] sm:h-[280px] md:h-[350px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="lap"
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
                tickFormatter={(v) => `#${v}`}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
                tickFormatter={(v) => `${formatLapTimeSeconds(v)} s`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload, label }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">Ronde #{label}</p>
                      <p className="text-muted-foreground">
                        Lap tijd: <span className="text-foreground font-medium">{formatLapTimeSeconds(Number(payload[0].value))} s</span>
                      </p>
                      {payload[0].payload.datum && (
                        <p className="text-muted-foreground text-xs">{formatDateDisplay(payload[0].payload.datum)}</p>
                      )}
                    </div>
                  ) : null
                }
              />
              <Line
                type="monotone"
                dataKey="lapTime"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const LapTimeLineChart = memo(LapTimeLineChartInner);
