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
import { getLapsPerSeasonData } from "@/lib/chart-utils";

interface LapsPerSeasonBarChartProps {
  laps: SchaatsLap[];
}

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "8px 12px",
};

function LapsPerSeasonBarChartInner({ laps }: LapsPerSeasonBarChartProps) {
  const data = getLapsPerSeasonData(laps);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ronden per seizoen</CardTitle>
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
        <CardTitle>Ronden per seizoen</CardTitle>
        <p className="text-muted-foreground text-sm">
          Aantal ronden per seizoen (okt–apr, bijv. 2024-2025)
        </p>
      </CardHeader>
      <CardContent className="px-3 pt-3 pb-0 sm:px-4 sm:pt-4 md:px-5 md:pt-5">
        <div className="h-[220px] sm:h-[280px] md:h-[350px] w-full min-w-0 bar-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#c4b8e8" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#d4caf5" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#e8e4f8" stopOpacity={0.95} />
                </linearGradient>
                <linearGradient id="barGradientDarkLapsPerSeason" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#4a4068" stopOpacity={0.85} />
                  <stop offset="50%" stopColor="#5c5080" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#6e6088" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="season"
                tick={{ fontSize: 9 }}
                className="text-[9px] sm:text-xs"
              />
              <YAxis tick={{ fontSize: 9 }} className="text-[9px] sm:text-xs" />
              <Tooltip
                contentStyle={tooltipStyle}
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div style={tooltipStyle} className="text-sm">
                      <p className="font-medium">{payload[0].payload.season}</p>
                      <p className="text-muted-foreground">
                        Ronden:{" "}
                        <span className="text-foreground font-medium">
                          {payload[0].payload.laps.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="laps"
                fill="url(#barGradient)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1}
                radius={[6, 6, 0, 0]}
                name="Ronden"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const LapsPerSeasonBarChart = memo(LapsPerSeasonBarChartInner);
