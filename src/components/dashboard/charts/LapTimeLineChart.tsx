import { memo, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
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
  const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: 49 });

  useEffect(() => {
    if (data.length > 0) {
      setBrushRange({
        startIndex: 0,
        endIndex: Math.min(49, data.length - 1),
      });
    }
  }, [data.length]);

  const displayData =
    data.length > 20
      ? data.slice(brushRange.startIndex, brushRange.endIndex + 1)
      : data;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rondetijden (s)</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="h-[220px] sm:h-[280px] md:h-[350px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 4, right: 4, left: -8, bottom: 36 }}>
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
              {data.length > 20 && (
                <Brush
                  dataKey="lap"
                  height={24}
                  stroke="var(--primary)"
                  fill="var(--muted)"
                  startIndex={brushRange.startIndex}
                  endIndex={brushRange.endIndex}
                  onChange={(range) => {
                    if (range?.startIndex != null && range?.endIndex != null) {
                      setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex });
                    }
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const LapTimeLineChart = memo(LapTimeLineChartInner);
