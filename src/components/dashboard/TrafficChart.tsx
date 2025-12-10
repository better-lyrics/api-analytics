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
import {
  useChartPreferences,
  type ViewMode,
  type TimeRange,
} from "@/stores/chartPreferences";
import type { TooltipProps } from "recharts";
import type {
  AnalyticsSnapshot,
  DeltaSnapshot,
  HistoricalDataPoint,
  TrafficChartPoint,
} from "@/types/analytics";
import type { DeltaDataPoint } from "@/utils/transforms";

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

interface DeltaChartPoint {
  date: string;
  requests: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  _original: DeltaDataPoint;
}

interface TrafficChartProps {
  snapshot: AnalyticsSnapshot;
  historicalSnapshots: HistoricalDataPoint[];
  deltaHistory: DeltaDataPoint[];
  deltaSum: DeltaSnapshot;
  hoveredPoint: HistoricalDataPoint | null;
  hoveredDelta: DeltaDataPoint | null;
  onHover: (point: HistoricalDataPoint | null) => void;
  onDeltaHover: (point: DeltaDataPoint | null) => void;
  isMobile: boolean;
  ready: boolean;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "area", label: "Area" },
  { value: "bar", label: "Bar" },
  { value: "scatter", label: "Scatter" },
];

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "total", label: "Total" },
  { value: "delta", label: "Hourly" },
];

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "6h", label: "6h" },
  { value: "12h", label: "12h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All" },
];

export function TrafficChart({
  snapshot,
  historicalSnapshots,
  deltaHistory,
  deltaSum,
  hoveredPoint,
  hoveredDelta,
  onHover,
  onDeltaHover,
  isMobile,
  ready,
}: TrafficChartProps) {
  const chartType = useChartPreferences((s) => s.trafficChartType);
  const setChartType = useChartPreferences((s) => s.setTrafficChartType);
  const viewMode = useChartPreferences((s) => s.viewMode);
  const setViewMode = useChartPreferences((s) => s.setViewMode);
  const timeRange = useChartPreferences((s) => s.timeRange);
  const setTimeRange = useChartPreferences((s) => s.setTimeRange);

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

  const deltaChartPoints: DeltaChartPoint[] = useMemo(
    () =>
      deltaHistory.map((point) => ({
        date: point.date,
        requests: point.delta.requests.total,
        cacheHits: point.delta.cache.hits,
        cacheMisses: point.delta.cache.misses,
        errors: point.delta.responses["5xx"],
        _original: point,
      })),
    [deltaHistory]
  );

  const chartData =
    viewMode === "total" ? trafficChartPoints : deltaChartPoints;

  const visibleTicks = useMemo(() => {
    const len = chartData.length;
    if (len <= 1) return chartData.map((p) => p.date);
    if (len <= 7) return chartData.map((p) => p.date);

    const maxTicks = len <= 14 ? 7 : len <= 30 ? 6 : 5;
    const step = (len - 1) / (maxTicks - 1);
    const indices = new Set<number>([0, len - 1]);

    for (let i = 1; i < maxTicks - 1; i++) {
      indices.add(Math.round(i * step));
    }

    return [...indices].sort((a, b) => a - b).map((i) => chartData[i].date);
  }, [chartData]);

  const displayedResponses =
    viewMode === "total" ? snapshot.responses : deltaSum.responses;
  const hasErrors =
    viewMode === "total"
      ? snapshot.responses["5xx"] > 0
      : deltaSum.responses["5xx"] > 0;

  const handleChartHover = (payload: unknown) => {
    if (viewMode === "total") {
      const point = payload as TrafficChartPoint | undefined;
      if (point?._original) {
        onHover(point._original);
      }
    } else {
      const point = payload as DeltaChartPoint | undefined;
      if (point?._original) {
        onDeltaHover(point._original);
      }
    }
  };

  const handleChartLeave = () => {
    onHover(null);
    onDeltaHover(null);
  };

  const hoveredDate = hoveredPoint?.date ?? hoveredDelta?.date;

  return (
    <section className="mb-6">
      <div className="card p-5 fade-in" style={{ animationDelay: "250ms" }}>
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex justify-between md:items-center md:flex-row flex-col md:gap-0 gap-4">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={Analytics02Icon}
                size={16}
                className="text-primary"
              />
              <Tooltip
                content={
                  viewMode === "total"
                    ? "Historical view of cumulative API requests. Hover to explore past data."
                    : "Hourly changes in API requests. Shows delta between each snapshot."
                }
              >
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Traffic Over Time
                </h3>
              </Tooltip>
              {hoveredDate && !isMobile && (
                <span className="text-xs text-muted-foreground font-mono">
                  {hoveredDate}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Tooltip
                content={
                  viewMode === "total"
                    ? "Successful responses (200-299)"
                    : "Successful responses delta in selected range"
                }
              >
                <span className="status-badge status-badge-success">
                  <NumberFlow
                    value={ready ? displayedResponses["2xx"] : 0}
                    className="font-mono text-white"
                  />{" "}
                  <span className="text-muted-foreground">2xx</span>
                </span>
              </Tooltip>
              {displayedResponses["4xx"] > 0 && (
                <Tooltip
                  content={
                    viewMode === "total"
                      ? "Client errors (400-499)"
                      : "Client errors delta in selected range"
                  }
                >
                  <span className="status-badge status-badge-error">
                    <NumberFlow
                      value={ready ? displayedResponses["4xx"] : 0}
                      className="font-mono text-white"
                    />{" "}
                    <span className="text-muted-foreground">4xx</span>
                  </span>
                </Tooltip>
              )}
              {hasErrors && (
                <Tooltip
                  content={
                    viewMode === "total"
                      ? "Server errors (500-599)"
                      : "Server errors delta in selected range"
                  }
                >
                  <span className="status-badge status-badge-error">
                    <NumberFlow
                      value={ready ? displayedResponses["5xx"] : 0}
                      className="font-mono text-white"
                    />{" "}
                    <span className="text-muted-foreground">5xx</span>
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wide rounded transition-colors ${
                    viewMode === mode.value
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-1">
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
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-1">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wide rounded transition-colors ${
                    timeRange === range.value
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="h-64">
          {chartType === "area" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  left: isMobile ? -10 : 0,
                  right: isMobile ? -10 : 20,
                }}
                onMouseMove={(state) => {
                  if (state?.activePayload?.[0]?.payload) {
                    handleChartHover(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={handleChartLeave}
              >
                <defs>
                  <linearGradient id="gradientReq" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(0, 75%, 55%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(0, 75%, 55%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="gradientCacheHits"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(0, 60%, 50%)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(0, 60%, 50%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="gradientCacheMisses"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(0, 30%, 40%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(0, 30%, 40%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="gradientErr" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="hsl(0, 50%, 35%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(0, 50%, 35%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  hide={isMobile}
                  tickMargin={8}
                  ticks={visibleTicks}
                />
                <YAxis
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 0 : 45}
                  hide={isMobile}
                />
                <RechartsTooltip content={<CustomTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(0, 75%, 55%)"
                  strokeWidth={2}
                  fill="url(#gradientReq)"
                  name="Total Requests"
                />
                <Area
                  type="monotone"
                  dataKey="cacheHits"
                  stroke="hsl(0, 60%, 50%)"
                  strokeWidth={1.5}
                  fill="url(#gradientCacheHits)"
                  name="Cache Hits"
                />
                <Area
                  type="monotone"
                  dataKey="cacheMisses"
                  stroke="hsl(0, 30%, 40%)"
                  strokeWidth={1}
                  fill="url(#gradientCacheMisses)"
                  name="Cache Misses"
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke="hsl(0, 50%, 35%)"
                  strokeWidth={1}
                  fill="url(#gradientErr)"
                  name="Errors"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {chartType === "bar" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  left: isMobile ? -10 : 0,
                  right: isMobile ? -10 : 20,
                }}
                onMouseMove={(state) => {
                  if (state?.activePayload?.[0]?.payload) {
                    handleChartHover(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={handleChartLeave}
              >
                <XAxis
                  dataKey="date"
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  hide={isMobile}
                  tickMargin={8}
                  ticks={visibleTicks}
                />
                <YAxis
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 0 : 45}
                  hide={isMobile}
                />
                <RechartsTooltip
                  content={<CustomTooltipContent />}
                  cursor={{ fill: "hsl(0, 0%, 10%)" }}
                />
                <Bar
                  dataKey="requests"
                  fill="hsl(0, 75%, 55%)"
                  name="Total Requests"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="cacheHits"
                  fill="hsl(0, 60%, 50%)"
                  name="Cache Hits"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="cacheMisses"
                  fill="hsl(0, 30%, 40%)"
                  name="Cache Misses"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="errors"
                  fill="hsl(0, 50%, 35%)"
                  name="Errors"
                  radius={[2, 2, 0, 0]}
                />
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
                  if (state?.activePayload?.[0]?.payload) {
                    handleChartHover(state.activePayload[0].payload);
                  }
                }}
                onMouseLeave={handleChartLeave}
              >
                <XAxis
                  dataKey="date"
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  hide={isMobile}
                  tickMargin={8}
                  ticks={visibleTicks}
                  type="category"
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  stroke="hsl(0, 0%, 15%)"
                  tick={{
                    fontSize: 10,
                    fontFamily: "IBM Plex Mono",
                    fill: "hsl(0, 0%, 40%)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={isMobile ? 0 : 45}
                  hide={isMobile}
                  type="number"
                  dataKey="requests"
                  name="Total Requests"
                />
                <RechartsTooltip
                  content={<CustomTooltipContent />}
                  cursor={{ stroke: "hsl(0, 0%, 20%)" }}
                />
                <Scatter
                  data={chartData}
                  fill="hsl(0, 75%, 55%)"
                  name="Total Requests"
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
        {isMobile && hoveredDate && (
          <p className="text-xs text-muted-foreground font-mono text-center mt-3 pt-3 border-t border-border">
            {hoveredDate}
          </p>
        )}
      </div>
    </section>
  );
}
