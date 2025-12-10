import type {
  AnalyticsRow,
  AnalyticsSnapshot,
  DeltaSnapshot,
  HistoricalDataPoint,
} from "@/types/analytics";
import {
  getCanonicalName,
  getFormerNames,
} from "@/config/account-migrations";

// -- Parsing Functions ---------------------------------------------------------

export function parseDuration(duration: string): number {
  const unitMultipliers: Record<string, number> = {
    µs: 1 / 1000,
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
  };

  let totalMs = 0;
  const regex = /([\d.]+)(µs|ms|s|m|h)/g;
  let match;

  while ((match = regex.exec(duration)) !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    totalMs += value * (unitMultipliers[unit] ?? 0);
  }

  return totalMs;
}

export function parseCooldown(cooldown: string): number {
  const match = cooldown.match(/^([\d.]+)s$/);
  return match ? parseFloat(match[1]) : 0;
}

// -- Account Migration ---------------------------------------------------------

function transformAccounts(
  accounts: Record<string, number>
): AnalyticsSnapshot["ttml_agents"] {
  const aggregated = new Map<string, number>();

  for (const [name, requests] of Object.entries(accounts)) {
    const canonicalName = getCanonicalName(name);
    aggregated.set(
      canonicalName,
      (aggregated.get(canonicalName) ?? 0) + requests
    );
  }

  return Array.from(aggregated.entries())
    .map(([name, requests]) => {
      const formerNames = getFormerNames(name);
      return {
        name,
        requests,
        ...(formerNames.length > 0 && { formerNames }),
      };
    })
    .sort((a, b) => b.requests - a.requests);
}

// -- Data Transformation -------------------------------------------------------

export function transformApiResponse(row: AnalyticsRow): AnalyticsSnapshot {
  const data = row.data;
  const uptimeHours = data.server.uptime_seconds / 3600;
  const uptimeMinutes = data.server.uptime_seconds / 60;

  return {
    timestamp: row.timestamp,
    requests: {
      total: data.requests.total,
      lyrics: data.requests.lyrics,
      cache: data.requests.cache,
      health: data.requests.health,
      stats: data.requests.stats,
      other: data.requests.other,
      per_hour:
        uptimeHours > 0 ? Math.round(data.requests.total / uptimeHours) : 0,
      per_minute:
        uptimeMinutes > 0
          ? Math.round((data.requests.total / uptimeMinutes) * 10) / 10
          : 0,
    },
    responses: data.responses,
    response_times: {
      avg: Math.round(parseDuration(data.response_times.avg)),
      avg_lyrics: Math.round(parseDuration(data.response_times.avg_lyrics)),
      min: Math.round(parseDuration(data.response_times.min)),
      max: Math.round(parseDuration(data.response_times.max)),
    },
    cache: {
      hits: data.cache.hits,
      misses: data.cache.misses,
      negative_hits: data.cache.negative_hits,
      stale_hits: data.cache.stale_hits,
      hit_rate: data.cache.hit_rate,
      keys: data.cache_storage.keys,
      storage_mb: data.cache_storage.size_mb,
    },
    circuit_breaker: {
      state: data.circuit_breaker.state,
      cooldown_remaining: parseCooldown(
        data.circuit_breaker.cooldown_remaining
      ),
      failures: data.circuit_breaker.failures,
    },
    rate_limiting: {
      normal_tier: data.rate_limiting.normal_tier,
      cached_tier: data.rate_limiting.cached_tier,
      exceeded: data.rate_limiting.exceeded,
    },
    server: {
      uptime_seconds: data.server.uptime_seconds,
      start_time: data.server.start_time,
    },
    ttml_agents: transformAccounts(data.accounts),
  };
}

// -- Delta Calculations --------------------------------------------------------

function computeAgentDeltas(
  current: AnalyticsSnapshot["ttml_agents"],
  previous: AnalyticsSnapshot["ttml_agents"]
): DeltaSnapshot["ttml_agents"] {
  const previousMap = new Map(previous.map((a) => [a.name, a.requests]));
  const deltas = current.map((agent) => ({
    name: agent.name,
    requests: agent.requests - (previousMap.get(agent.name) ?? 0),
    formerNames: agent.formerNames,
  }));
  return deltas.sort((a, b) => b.requests - a.requests);
}

export function computeDeltaSnapshot(
  current: AnalyticsSnapshot,
  previous: AnalyticsSnapshot
): DeltaSnapshot {
  return {
    requests: {
      total: current.requests.total - previous.requests.total,
      lyrics: current.requests.lyrics - previous.requests.lyrics,
      cache: current.requests.cache - previous.requests.cache,
      health: current.requests.health - previous.requests.health,
      stats: current.requests.stats - previous.requests.stats,
      other: current.requests.other - previous.requests.other,
    },
    responses: {
      "2xx": current.responses["2xx"] - previous.responses["2xx"],
      "4xx": current.responses["4xx"] - previous.responses["4xx"],
      "5xx": current.responses["5xx"] - previous.responses["5xx"],
    },
    cache: {
      hits: current.cache.hits - previous.cache.hits,
      misses: current.cache.misses - previous.cache.misses,
      negative_hits: current.cache.negative_hits - previous.cache.negative_hits,
      stale_hits: current.cache.stale_hits - previous.cache.stale_hits,
    },
    storage: {
      keys: current.cache.keys - previous.cache.keys,
      storage_mb: current.cache.storage_mb - previous.cache.storage_mb,
    },
    rate_limiting: {
      normal_tier:
        current.rate_limiting.normal_tier - previous.rate_limiting.normal_tier,
      cached_tier:
        current.rate_limiting.cached_tier - previous.rate_limiting.cached_tier,
      exceeded:
        current.rate_limiting.exceeded - previous.rate_limiting.exceeded,
    },
    circuit_breaker: {
      failures:
        current.circuit_breaker.failures - previous.circuit_breaker.failures,
    },
    ttml_agents: computeAgentDeltas(current.ttml_agents, previous.ttml_agents),
  };
}

export interface DeltaDataPoint {
  date: string;
  timestamp: number;
  delta: DeltaSnapshot;
  snapshot: AnalyticsSnapshot;
}

export function computeDeltaHistory(
  historicalSnapshots: HistoricalDataPoint[]
): DeltaDataPoint[] {
  if (historicalSnapshots.length < 2) return [];

  return historicalSnapshots.slice(1).map((point, index) => ({
    date: point.date,
    timestamp: point.timestamp,
    delta: computeDeltaSnapshot(
      point.snapshot,
      historicalSnapshots[index].snapshot
    ),
    snapshot: point.snapshot,
  }));
}

// -- Time Range Filtering ------------------------------------------------------

import type { TimeRange } from "@/stores/chartPreferences";

const TIME_RANGE_HOURS: Record<TimeRange, number | null> = {
  "6h": 6,
  "12h": 12,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  all: null,
};

export function filterByTimeRange<T extends { timestamp: number }>(
  data: T[],
  timeRange: TimeRange
): T[] {
  const hours = TIME_RANGE_HOURS[timeRange];
  if (hours === null) return data;

  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return data.filter((point) => point.timestamp >= cutoff);
}

export function sumDeltasInRange(deltaHistory: DeltaDataPoint[]): DeltaSnapshot {
  const initial: DeltaSnapshot = {
    requests: { total: 0, lyrics: 0, cache: 0, health: 0, stats: 0, other: 0 },
    responses: { "2xx": 0, "4xx": 0, "5xx": 0 },
    cache: { hits: 0, misses: 0, negative_hits: 0, stale_hits: 0 },
    storage: { keys: 0, storage_mb: 0 },
    rate_limiting: { normal_tier: 0, cached_tier: 0, exceeded: 0 },
    circuit_breaker: { failures: 0 },
    ttml_agents: [],
  };

  const agentMap = new Map<
    string,
    { requests: number; formerNames?: string[] }
  >();

  const summed = deltaHistory.reduce(
    (acc, point) => {
      for (const agent of point.delta.ttml_agents) {
        const existing = agentMap.get(agent.name);
        if (existing) {
          existing.requests += agent.requests;
        } else {
          agentMap.set(agent.name, {
            requests: agent.requests,
            formerNames: agent.formerNames,
          });
        }
      }

      return {
        requests: {
          total: acc.requests.total + point.delta.requests.total,
          lyrics: acc.requests.lyrics + point.delta.requests.lyrics,
          cache: acc.requests.cache + point.delta.requests.cache,
          health: acc.requests.health + point.delta.requests.health,
          stats: acc.requests.stats + point.delta.requests.stats,
          other: acc.requests.other + point.delta.requests.other,
        },
        responses: {
          "2xx": acc.responses["2xx"] + point.delta.responses["2xx"],
          "4xx": acc.responses["4xx"] + point.delta.responses["4xx"],
          "5xx": acc.responses["5xx"] + point.delta.responses["5xx"],
        },
        cache: {
          hits: acc.cache.hits + point.delta.cache.hits,
          misses: acc.cache.misses + point.delta.cache.misses,
          negative_hits:
            acc.cache.negative_hits + point.delta.cache.negative_hits,
          stale_hits: acc.cache.stale_hits + point.delta.cache.stale_hits,
        },
        storage: {
          keys: acc.storage.keys + point.delta.storage.keys,
          storage_mb: acc.storage.storage_mb + point.delta.storage.storage_mb,
        },
        rate_limiting: {
          normal_tier:
            acc.rate_limiting.normal_tier + point.delta.rate_limiting.normal_tier,
          cached_tier:
            acc.rate_limiting.cached_tier + point.delta.rate_limiting.cached_tier,
          exceeded:
            acc.rate_limiting.exceeded + point.delta.rate_limiting.exceeded,
        },
        circuit_breaker: {
          failures:
            acc.circuit_breaker.failures + point.delta.circuit_breaker.failures,
        },
        ttml_agents: [],
      };
    },
    initial
  );

  summed.ttml_agents = Array.from(agentMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.requests - a.requests);

  return summed;
}
