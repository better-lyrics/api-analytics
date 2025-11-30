"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { ANIMATION_READY_DELAY_MS } from "@/lib/supabase";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { useMobile } from "@/hooks/useMobile";
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
  const isMobile = useMobile();

  const { data: latestSnapshot, isLoading, isError } = useAnalytics();
  const { data: historicalSnapshots = [] } = useHistoricalData();

  useEffect(() => {
    if (latestSnapshot && !ready) {
      const timer = setTimeout(() => setReady(true), ANIMATION_READY_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [latestSnapshot, ready]);

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

  const displayedSnapshot = hoveredPoint?.snapshot ?? latestSnapshot;
  const isSystemHealthy = displayedSnapshot.circuit_breaker.state === "CLOSED";

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        <Header isSystemHealthy={isSystemHealthy} />

        <MetricsGrid snapshot={displayedSnapshot} ready={ready} />

        <TrafficChart
          snapshot={displayedSnapshot}
          historicalSnapshots={historicalSnapshots}
          hoveredPoint={hoveredPoint}
          onHover={setHoveredPoint}
          isMobile={isMobile}
          ready={ready}
        />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <AgentsChart snapshot={displayedSnapshot} />
          <RequestsBreakdown snapshot={displayedSnapshot} ready={ready} />
        </section>

        <StatusGrid snapshot={displayedSnapshot} ready={ready} />

        <Footer
          hoveredPoint={hoveredPoint}
          latestTimestamp={latestSnapshot.timestamp}
        />
      </div>
    </div>
  );
}
