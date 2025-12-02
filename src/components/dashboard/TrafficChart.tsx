import { useMemo } from "react";
import NumberFlow from "@number-flow/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics02Icon } from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { useChartPreferences } from "@/stores/chartPreferences";
import type { TooltipProps } from "recharts";
import type {
  AnalyticsSnapshot,
  HistoricalDataPoint,
  TrafficChartPoint,
} from "@/types/analytics";

// -- Types --------------------------------------------------------------------

type ChartType = "area" | "bar" | "scatter";

// -- Custom Tooltip -----------------------------------------------------------

const METRIC_COLORS: Record<string, string> = {
  "Total Requests": "hsl(0, 75%, 55%)",
  "Cache Hits": "hsl(0, 60%, 50%)",
  "Cache Misses": "hsl(0, 30%, 40%)",
  Errors: "hsl(0, 50%, 35%)",
};

function CustomTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const sortedPayload = [...payload].sort(
    (a, b) => (b.value as number) - (a.value as number)
  );

  return (
    <div
      style={{
        background: "hsl(0, 0%, 5%)",
        border: "1px solid hsl(0, 0%, 15%)",
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "IBM Plex Mono",
      }}
    >
      <p style={{ color: "hsl(0, 0%, 60%)", marginBottom: 4 }}>{label}</p>
      {sortedPayload.map((entry) => (
        <p
          key={entry.name}
          style={{ color: METRIC_COLORS[entry.name || ""] || "#fff" }}
        >
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

interface TrafficChartProps {
  snapshot: AnalyticsSnapshot;
  historicalSnapshots: HistoricalDataPoint[];
  hoveredPoint: HistoricalDataPoint | null;
  onHover: (point: HistoricalDataPoint | null) => void;
  isMobile: boolean;
  ready: boolean;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "area", label: "Area" },
  { value: "bar", label: "Bar" },
  { value: "scatter", label: "Scatter" },
];

export function TrafficChart({
  snapshot,
  historicalSnapshots,
  hoveredPoint,
  onHover,
  isMobile,
  ready,
}: TrafficChartProps) {
  const chartType = useChartPreferences((s) => s.trafficChartType);
  const setChartType = useChartPreferences((s) => s.setTrafficChartType);

  const trafficChartPoints: TrafficChartPoint[] = useMemo(
    () =>
      historicalSnapshots.map((point) => ({
        date: point.date,
        requests: point.snapshot.requests.total,
        cacheHits: point.snapshot.cache.hits,
        cacheMisses: point.snapshot.cache.misses,
        errors: point.snapshot.responses["5xx"],
        _original: point,
      })),
    [historicalSnapshots]
  );

  const visibleTicks = useMemo(() => {
    const len = trafficChartPoints.length;
    if (len <= 1) return trafficChartPoints.map((p) => p.date);
    if (len <= 7) return trafficChartPoints.map((p) => p.date);

    const maxTicks = len <= 14 ? 7 : len <= 30 ? 6 : 5;
    const step = (len - 1) / (maxTicks - 1);
    const indices = new Set<number>([0, len - 1]);

    for (let i = 1; i < maxTicks - 1; i++) {
      indices.add(Math.round(i * step));
    }

    return [...indices].sort((a, b) => a - b).map((i) => trafficChartPoints[i].date);
  }, [trafficChartPoints]);

  const hasErrors = snapshot.responses["5xx"] > 0;

  return (
    <section className="mb-6">
      <div className="card p-5 fade-in" style={{ animationDelay: "250ms" }}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Analytics02Icon}
              size={16}
              className="text-primary"
            />
            <Tooltip content="Historical view of API requests and errors. Hover to explore past data.">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Traffic Over Time
              </h3>
            </Tooltip>
            {hoveredPoint && !isMobile && (
              <span className="text-xs text-muted-foreground font-mono">
                {hoveredPoint.date}
              </span>
            )}
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
          <div className="flex gap-2">
            <Tooltip content="Successful responses (200-299)">
              <span className="status-badge status-badge-success">
                <NumberFlow
                  value={ready ? snapshot.responses["2xx"] : 0}
                  className="font-mono text-white"
                />{" "}
                <span className="text-muted-foreground">2xx</span>
              </span>
            </Tooltip>
            {snapshot.responses["4xx"] > 0 && (
              <Tooltip content="Client errors (400-499)">
                <span className="status-badge status-badge-error">
                  <NumberFlow
                    value={ready ? snapshot.responses["4xx"] : 0}
                    className="font-mono text-white"
                  />{" "}
                  <span className="text-muted-foreground">4xx</span>
                </span>
              </Tooltip>
            )}
            {hasErrors && (
              <Tooltip content="Server errors (500-599)">
                <span className="status-badge status-badge-error">
                  <NumberFlow
                    value={ready ? snapshot.responses["5xx"] : 0}
                    className="font-mono text-white"
                  />{" "}
                  <span className="text-muted-foreground">5xx</span>
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="h-64">
          {chartType === "area" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trafficChartPoints}
                margin={{
                  left: isMobile ? -10 : 0,
                  right: isMobile ? -10 : 20,
                }}
                onMouseMove={(state) => {
                  if (state?.activePayload?.[0]?.payload?._original) {
                    onHover(
                      state.activePayload[0].payload._original as HistoricalDataPoint
                    );
                  }
                }}
                onMouseLeave={() => onHover(null)}
              >
                <defs>
                  <linearGradient id="gradientReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(0, 75%, 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientCacheHits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 60%, 50%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(0, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientCacheMisses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 30%, 40%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(0, 30%, 40%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 50%, 35%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(0, 50%, 35%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} hide={isMobile} tickMargin={8} ticks={visibleTicks} />
                <YAxis stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} width={isMobile ? 0 : 45} hide={isMobile} />
                <RechartsTooltip content={<CustomTooltipContent />} />
                <Area type="monotone" dataKey="requests" stroke="hsl(0, 75%, 55%)" strokeWidth={2} fill="url(#gradientReq)" name="Total Requests" />
                <Area type="monotone" dataKey="cacheHits" stroke="hsl(0, 60%, 50%)" strokeWidth={1.5} fill="url(#gradientCacheHits)" name="Cache Hits" />
                <Area type="monotone" dataKey="cacheMisses" stroke="hsl(0, 30%, 40%)" strokeWidth={1} fill="url(#gradientCacheMisses)" name="Cache Misses" />
                <Area type="monotone" dataKey="errors" stroke="hsl(0, 50%, 35%)" strokeWidth={1} fill="url(#gradientErr)" name="Errors" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trafficChartPoints}
                margin={{
                  left: isMobile ? -10 : 0,
                  right: isMobile ? -10 : 20,
                }}
                onMouseMove={(state) => {
                  if (state?.activePayload?.[0]?.payload?._original) {
                    onHover(
                      state.activePayload[0].payload._original as HistoricalDataPoint
                    );
                  }
                }}
                onMouseLeave={() => onHover(null)}
              >
                <XAxis dataKey="date" stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} hide={isMobile} tickMargin={8} ticks={visibleTicks} />
                <YAxis stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} width={isMobile ? 0 : 45} hide={isMobile} />
                <RechartsTooltip content={<CustomTooltipContent />} cursor={{ fill: "hsl(0, 0%, 10%)" }} />
                <Bar dataKey="requests" fill="hsl(0, 75%, 55%)" name="Total Requests" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cacheHits" fill="hsl(0, 60%, 50%)" name="Cache Hits" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cacheMisses" fill="hsl(0, 30%, 40%)" name="Cache Misses" radius={[2, 2, 0, 0]} />
                <Bar dataKey="errors" fill="hsl(0, 50%, 35%)" name="Errors" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartType === "scatter" && (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  left: isMobile ? -10 : 0,
                  right: isMobile ? -10 : 20,
                }}
                onMouseMove={(state) => {
                  if (state?.activePayload?.[0]?.payload?._original) {
                    onHover(
                      state.activePayload[0].payload._original as HistoricalDataPoint
                    );
                  }
                }}
                onMouseLeave={() => onHover(null)}
              >
                <XAxis dataKey="date" stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} hide={isMobile} tickMargin={8} ticks={visibleTicks} type="category" allowDuplicatedCategory={false} />
                <YAxis stroke="hsl(0, 0%, 15%)" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono", fill: "hsl(0, 0%, 40%)" }} tickLine={false} axisLine={false} width={isMobile ? 0 : 45} hide={isMobile} type="number" dataKey="requests" name="Total Requests" />
                <RechartsTooltip content={<CustomTooltipContent />} cursor={{ stroke: "hsl(0, 0%, 20%)" }} />
                <Scatter data={trafficChartPoints} fill="hsl(0, 75%, 55%)" name="Total Requests" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
        {isMobile && hoveredPoint && (
          <p className="text-xs text-muted-foreground font-mono text-center mt-3 pt-3 border-t border-border">
            {hoveredPoint.date}
          </p>
        )}
      </div>
    </section>
  );
}
