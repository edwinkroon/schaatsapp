import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchaatsLap } from "@/lib/data";
import { formatDateDisplay } from "@/lib/utils";
import { getLapTimeChartData } from "@/lib/chart-utils";

interface SpeedLineChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function SpeedLineChartInner({ laps }: SpeedLineChartProps) {
  const data = getLapTimeChartData(laps).map((d) => ({ ...d, snelheid: Math.round(d.snelheid * 10) / 10 }));
  const avgSnelheid = data.length > 0
    ? Math.round((data.reduce((s, d) => s + d.snelheid, 0) / data.length) * 10) / 10
    : 0;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Snelheid per ronde</CardTitle>
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
        <CardTitle>Snelheid per ronde (km/h)</CardTitle>
        <p className="text-muted-foreground text-sm">
          Zie hoe je snelheid verandert tijdens een sessie. Gemiddeld: {avgSnelheid} km/h
        </p>
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
                tickFormatter={(v) => String(v)}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
                tickFormatter={(v) => `${v} km/h`}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload, label }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">Ronde #{label}</p>
                      <p className="text-muted-foreground">
                        Snelheid: <span className="text-foreground font-medium">{payload[0].value} km/h</span>
                      </p>
                      {payload[0].payload.datum && (
                        <p className="text-muted-foreground text-xs">{formatDateDisplay(payload[0].payload.datum)}</p>
                      )}
                    </div>
                  ) : null
                }
              />
              <ReferenceLine y={avgSnelheid} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="snelheid"
                stroke="var(--chart-2)"
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

export const SpeedLineChart = memo(SpeedLineChartInner);
