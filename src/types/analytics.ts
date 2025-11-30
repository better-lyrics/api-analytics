import type { ReactNode } from "react";

// -- API Response Types --------------------------------------------------------

export interface StatsApiResponse {
  accounts: Record<string, number>;
  cache: {
    hit_rate: number;
    hits: number;
    misses: number;
    negative_hits: number;
    stale_hits: number;
  };
  cache_storage: {
    keys: number;
    size_kb: number;
    size_mb: number;
  };
  circuit_breaker: {
    cooldown_remaining: string;
    failures: number;
    state: "CLOSED" | "OPEN" | "HALF_OPEN";
  };
  rate_limiting: {
    cached_tier: number;
    exceeded: number;
    normal_tier: number;
  };
  requests: {
    cache: number;
    health: number;
    lyrics: number;
    other: number;
    per_hour: number;
    per_minute: number;
    stats: number;
    total: number;
  };
  response_times: {
    avg: string;
    avg_lyrics: string;
    max: string;
    min: string;
  };
  responses: {
    "2xx": number;
    "4xx": number;
    "5xx": number;
  };
  server: {
    start_time: string;
    uptime: string;
    uptime_seconds: number;
  };
}

// -- Database Types ------------------------------------------------------------

export interface AnalyticsRow {
  id: number;
  timestamp: string;
  data: StatsApiResponse;
}

// -- Dashboard Types -----------------------------------------------------------

export interface AnalyticsSnapshot {
  timestamp: string;
  requests: {
    total: number;
    lyrics: number;
    cache: number;
    health: number;
    stats: number;
    other: number;
    per_hour: number;
    per_minute: number;
  };
  responses: {
    "2xx": number;
    "4xx": number;
    "5xx": number;
  };
  response_times: {
    avg: number;
    avg_lyrics: number;
    min: number;
    max: number;
  };
  cache: {
    hits: number;
    misses: number;
    negative_hits: number;
    stale_hits: number;
    hit_rate: number;
    keys: number;
    storage_mb: number;
  };
  circuit_breaker: {
    state: "CLOSED" | "OPEN" | "HALF_OPEN";
    cooldown_remaining: number;
    failures: number;
  };
  rate_limiting: {
    normal_tier: number;
    cached_tier: number;
    exceeded: number;
  };
  server: {
    uptime_seconds: number;
    start_time: string;
  };
  ttml_agents: Array<{
    name: string;
    requests: number;
  }>;
}

export interface HistoricalDataPoint {
  date: string;
  snapshot: AnalyticsSnapshot;
}

export interface TrafficChartPoint {
  date: string;
  requests: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  _original: HistoricalDataPoint;
}

// -- Component Props -----------------------------------------------------------

export interface TooltipProps {
  content: string;
  children: ReactNode;
}

export interface MetricCardProps {
  label: string;
  value: number | string | ReactNode;
  suffix?: string;
  subtext?: ReactNode;
  icon: ReactNode;
  delay?: number;
  tooltip?: string;
}
