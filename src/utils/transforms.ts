import type { AnalyticsRow, AnalyticsSnapshot } from "@/types/analytics";
import {
  getCanonicalName,
  getFormerNames,
} from "@/config/account-migrations";

// -- Parsing Functions ---------------------------------------------------------

export function parseDuration(duration: string): number {
  const match = duration.match(/^([\d.]+)(µs|ms|s|m|h)$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2];
  switch (unit) {
    case "µs":
      return value / 1000;
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return 0;
  }
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
