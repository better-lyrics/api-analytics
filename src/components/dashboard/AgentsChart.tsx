import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip as RechartsTooltip,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { Vynil03Icon } from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import type { AnalyticsSnapshot } from "@/types/analytics";

interface AgentsChartProps {
  snapshot: AnalyticsSnapshot;
}

export function AgentsChart({ snapshot }: AgentsChartProps) {
  return (
    <div
      className="lg:col-span-2 card p-5 fade-in"
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <HugeiconsIcon icon={Vynil03Icon} size={16} className="text-primary" />
        <Tooltip content="Breakdown of requests by TTML client/user agent">
          <h3 className="text-sm font-bold uppercase tracking-wider">
            TTML Agents
          </h3>
        </Tooltip>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={snapshot.ttml_agents}
            layout="vertical"
            margin={{ left: 10, right: 20 }}
          >
            <XAxis
              type="number"
              stroke="hsl(0, 0%, 15%)"
              tick={{
                fontSize: 10,
                fontFamily: "IBM Plex Mono",
                fill: "hsl(0, 0%, 40%)",
              }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(0, 0%, 15%)"
              tick={{
                fontSize: 11,
                fontFamily: "IBM Plex Mono",
                fill: "hsl(0, 0%, 60%)",
              }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <RechartsTooltip
              contentStyle={{
                background: "hsl(0, 0%, 5%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: 0,
                fontSize: 12,
                fontFamily: "IBM Plex Mono",
                color: "hsl(0, 0%, 90%)",
              }}
              labelStyle={{ color: "hsl(0, 0%, 60%)" }}
              itemStyle={{ color: "hsl(0, 75%, 55%)" }}
              cursor={{ fill: "hsl(0, 0%, 10%)" }}
            />
            <Bar dataKey="requests" radius={[0, 2, 2, 0]}>
              {snapshot.ttml_agents.map((_, index) => {
                const lightness = 55 - index * 8;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(0, 75%, ${lightness}%)`}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
