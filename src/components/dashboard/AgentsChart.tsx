import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useChartPreferences } from "@/stores/chartPreferences";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip as RechartsTooltip,
  type TooltipProps,
} from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { HugeiconsIcon } from "@hugeicons/react";
import { Vynil03Icon } from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { DeltaIndicator } from "@/components/ui/DeltaIndicator";
import type { AnalyticsSnapshot, DeltaSnapshot } from "@/types/analytics";
import type { ViewMode } from "@/stores/chartPreferences";

type AgentTooltipProps = TooltipProps<ValueType, NameType>;

function CustomTooltip({ active, payload }: AgentTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload as AnalyticsSnapshot["ttml_agents"][number];
  const { name, requests, formerNames } = data;

  return (
    <div
      className="border px-3 py-2"
      style={{
        background: "hsl(0, 0%, 5%)",
        borderColor: "hsl(0, 0%, 15%)",
        fontSize: 12,
        fontFamily: "IBM Plex Mono",
      }}
    >
      <p style={{ color: "hsl(0, 0%, 90%)" }}>{name}</p>
      <p style={{ color: "hsl(0, 75%, 55%)" }}>
        {requests.toLocaleString()} requests
      </p>
      {formerNames && formerNames.length > 0 && (
        <p className="mt-1 text-[10px]" style={{ color: "hsl(0, 0%, 45%)" }}>
          formerly: {formerNames.join(", ")}
        </p>
      )}
    </div>
  );
}

type ChartType = "bar" | "pie";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
];

function PieStats({
  agents,
  activeIndex,
}: {
  agents: AnalyticsSnapshot["ttml_agents"];
  activeIndex: number | null;
}) {
  const total = agents.reduce((sum, a) => sum + a.requests, 0);
  const index = activeIndex ?? 0;
  const agent = agents[index];
  const percent = total > 0 ? (agent.requests / total) * 100 : 0;
  const rank = index + 1;

  return (
    <div className="w-1/2 flex flex-col justify-center gap-3 pl-4 text-xs font-mono overflow-hidden">
      <div>
        <span className="text-muted-foreground">Agent</span>
        <div className="relative h-fit overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.p
              key={agent.name}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                y: -14,
                filter: "blur(4px)",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              transition={{
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-primary text-sm font-bold flex items-center gap-2"
            >
              {agent.name}
              <AnimatePresence>
                {agent.formerNames && agent.formerNames.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-normal text-muted-foreground bg-muted px-1 py-0.5 rounded origin-left"
                  >
                    fka {agent.formerNames[0]}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div>
        <span className="text-muted-foreground">Requests</span>
        <p className="text-foreground">
          <NumberFlow value={agent.requests} />
        </p>
      </div>
      <div>
        <span className="text-muted-foreground">Share</span>
        <p className="text-foreground">
          <NumberFlow value={percent} format={{ maximumFractionDigits: 1 }} />%
          of total
        </p>
      </div>
      <div>
        <span className="text-muted-foreground">Rank</span>
        <p className="text-foreground">
          #<NumberFlow value={rank} /> of {agents.length}
        </p>
      </div>
    </div>
  );
}

interface AgentsChartProps {
  snapshot: AnalyticsSnapshot;
  deltaSum: DeltaSnapshot;
  viewMode: ViewMode;
}

export function AgentsChart({
  snapshot,
  deltaSum,
  viewMode,
}: AgentsChartProps) {
  const chartType = useChartPreferences((s) => s.agentsChartType);
  const setChartType = useChartPreferences((s) => s.setAgentsChartType);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isDelta = viewMode === "delta";
  const agents = isDelta ? deltaSum.ttml_agents : snapshot.ttml_agents;

  return (
    <div
      className="lg:col-span-2 card p-5 fade-in"
      style={{ animationDelay: "300ms" }}
    >
      <div className="flex items-center gap-3 mb-5 justify-between">
        <div className="flex gap-3">
          <HugeiconsIcon
            icon={Vynil03Icon}
            size={16}
            className="text-primary"
          />
          <Tooltip
            content={
              isDelta
                ? "Change in requests by TTML client during selected range"
                : "Breakdown of requests by TTML client/user agent"
            }
          >
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
              TTML Agents
              <DeltaIndicator show={isDelta} />
            </h3>
          </Tooltip>
        </div>
        <div className="flex gap-1 ml-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setChartType(type.value)}
              className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wide rounded transition-colors ${
                chartType === type.value
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={agents}
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
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(0, 0%, 10%)" }}
              />
              <Bar dataKey="requests" radius={[0, 2, 2, 0]}>
                {agents.map((_, index) => {
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
        )}
        {chartType === "pie" && (
          <div className="flex h-full">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agents}
                    dataKey="requests"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={90}
                    stroke="none"
                    animationDuration={400}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {agents.map((_, index) => {
                      const lightness = 55 - index * 8;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(0, 75%, ${lightness}%)`}
                          onMouseEnter={() => setHoveredIndex(index)}
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieStats agents={agents} activeIndex={hoveredIndex} />
          </div>
        )}
      </div>
    </div>
  );
}
