"use client";

import { useState, useEffect, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { ANIMATION_READY_DELAY_MS } from "@/lib/supabase";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useMobile } from "@/hooks/useMobile";
import { useChartPreferences } from "@/stores/chartPreferences";
import {
  computeDeltaHistory,
  filterByTimeRange,
  sumDeltasInRange,
  type DeltaDataPoint,
} from "@/utils/transforms";
import { Header } from "@/components/dashboard/Header";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { AgentsChart } from "@/components/dashboard/AgentsChart";
import { RequestsBreakdown } from "@/components/dashboard/RequestsBreakdown";
import { StatusGrid } from "@/components/dashboard/StatusGrid";
import { Footer } from "@/components/dashboard/Footer";
import type { HistoricalDataPoint } from "@/types/analytics";

export default function App() {
  const [ready, setReady] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalDataPoint | null>(
    null
  );
  const [hoveredDelta, setHoveredDelta] = useState<DeltaDataPoint | null>(null);
  const [pinnedPoint, setPinnedPoint] = useState<HistoricalDataPoint | null>(
    null
  );
  const [pinnedDelta, setPinnedDelta] = useState<DeltaDataPoint | null>(null);
  const isMobile = useMobile();

  const viewMode = useChartPreferences((s) => s.viewMode);
  const timeRange = useChartPreferences((s) => s.timeRange);

  const { data: latestSnapshot, isLoading, isError } = useAnalytics();
  const { data: historicalSnapshots = [] } = useHistoricalData();

  const filteredHistorical = useMemo(
    () => filterByTimeRange(historicalSnapshots, timeRange),
    [historicalSnapshots, timeRange]
  );

  const deltaHistory = useMemo(
    () => computeDeltaHistory(filteredHistorical),
    [filteredHistorical]
  );

  const filteredDeltaHistory = useMemo(
    () => filterByTimeRange(deltaHistory, timeRange),
    [deltaHistory, timeRange]
  );

  const deltaSum = useMemo(
    () => sumDeltasInRange(filteredDeltaHistory),
    [filteredDeltaHistory]
  );

  useEffect(() => {
    if (latestSnapshot && !ready) {
      const timer = setTimeout(() => setReady(true), ANIMATION_READY_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [latestSnapshot, ready]);

  useEffect(() => {
    setPinnedPoint(null);
    setPinnedDelta(null);
  }, [viewMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-mono text-xs tracking-wider">
            LOADING
          </p>
        </div>
      </div>
    );
  }

  if (isError || !latestSnapshot) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <HugeiconsIcon
            icon={Alert02Icon}
            className="w-6 h-6 text-primary mx-auto mb-3"
          />
          <p className="text-primary font-mono text-xs tracking-wider">ERROR</p>
        </div>
      </div>
    );
  }

  const displayedSnapshot =
    pinnedPoint?.snapshot ??
    pinnedDelta?.snapshot ??
    hoveredPoint?.snapshot ??
    hoveredDelta?.snapshot ??
    latestSnapshot;
  const displayedDelta = pinnedDelta?.delta ?? hoveredDelta?.delta ?? deltaSum;
  const isSystemHealthy = displayedSnapshot.circuit_breaker.state === "CLOSED";

  return (
    <div className="min-h-screen w-screen overflow-hidden">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <Header isSystemHealthy={isSystemHealthy} />

        <MetricsGrid
          snapshot={displayedSnapshot}
          deltaSum={displayedDelta}
          viewMode={viewMode}
          ready={ready}
        />

        <TrafficChart
          snapshot={displayedSnapshot}
          historicalSnapshots={filteredHistorical}
          deltaHistory={filteredDeltaHistory}
          deltaSum={displayedDelta}
          hoveredPoint={hoveredPoint}
          hoveredDelta={hoveredDelta}
          pinnedPoint={pinnedPoint}
          pinnedDelta={pinnedDelta}
          onHover={setHoveredPoint}
          onDeltaHover={setHoveredDelta}
          onPin={setPinnedPoint}
          onDeltaPin={setPinnedDelta}
          isMobile={isMobile}
          ready={ready}
        />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <AgentsChart
            snapshot={displayedSnapshot}
            deltaSum={displayedDelta}
            viewMode={viewMode}
          />
          <RequestsBreakdown
            snapshot={displayedSnapshot}
            deltaSum={displayedDelta}
            viewMode={viewMode}
            ready={ready}
          />
        </section>

        <StatusGrid
          snapshot={displayedSnapshot}
          deltaSum={displayedDelta}
          viewMode={viewMode}
          ready={ready}
        />

        <Footer
          hoveredPoint={hoveredPoint}
          hoveredDelta={hoveredDelta}
          pinnedPoint={pinnedPoint}
          pinnedDelta={pinnedDelta}
          latestTimestamp={latestSnapshot.timestamp}
        />
      </div>
    </div>
  );
}
