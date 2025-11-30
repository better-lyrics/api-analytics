import NumberFlow from "@number-flow/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ElectricHome02Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  HardDriveIcon,
} from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import type { AnalyticsSnapshot } from "@/types/analytics";

interface StatusGridProps {
  snapshot: AnalyticsSnapshot;
  ready: boolean;
}

export function StatusGrid({ snapshot, ready }: StatusGridProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Circuit Breaker */}
      <div className="card p-5 fade-in" style={{ animationDelay: "350ms" }}>
        <div className="flex items-start justify-between mb-2">
          <Tooltip content="Protection mechanism that stops requests to failing services. CLOSED = healthy, OPEN = blocking requests, HALF_OPEN = testing recovery.">
            <span className="metric-label">Circuit Breaker</span>
          </Tooltip>
          <HugeiconsIcon
            icon={ElectricHome02Icon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium">
          <span className="font-mono text-primary">
            {snapshot.circuit_breaker.state}
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <NumberFlow
            value={ready ? snapshot.circuit_breaker.failures : 0}
            className="font-mono"
          />{" "}
          failures
          {snapshot.circuit_breaker.cooldown_remaining > 0 && (
            <>
              {" "}
              | Cooldown:{" "}
              <NumberFlow
                value={ready ? snapshot.circuit_breaker.cooldown_remaining : 0}
                className="font-mono"
              />
              s
            </>
          )}
        </p>
      </div>

      {/* Rate Limit */}
      <div className="card p-5 fade-in" style={{ animationDelay: "400ms" }}>
        <div className="flex items-start justify-between mb-2">
          <Tooltip content="Requests processed per rate limit tier. Normal tier has stricter limits, cached tier allows more requests.">
            <span className="metric-label">Rate Limit</span>
          </Tooltip>
          <HugeiconsIcon
            icon={DashboardSpeed01Icon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium font-mono">
          <NumberFlow value={ready ? snapshot.rate_limiting.normal_tier : 0} />
          <span className="text-muted-foreground text-sm ml-1 font-normal">
            normal
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <NumberFlow
            value={ready ? snapshot.rate_limiting.cached_tier : 0}
            className="font-mono"
          />{" "}
          cached
          {snapshot.rate_limiting.exceeded > 0 && (
            <>
              {" "}
              |{" "}
              <span className="text-primary">
                <NumberFlow
                  value={ready ? snapshot.rate_limiting.exceeded : 0}
                  className="font-mono"
                />{" "}
                exceeded
              </span>
            </>
          )}
        </p>
      </div>

      {/* Cache Stats */}
      <div className="card p-5 fade-in" style={{ animationDelay: "450ms" }}>
        <div className="flex items-start justify-between mb-2">
          <Tooltip content="Cache performance: hits (served from cache), miss (fetched fresh), neg (cached 404s), stale (expired but served while refreshing).">
            <span className="metric-label">Cache Stats</span>
          </Tooltip>
          <HugeiconsIcon
            icon={Database01Icon}
            className="text-primary"
            size={18}
          />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <NumberFlow
              value={ready ? snapshot.cache.hits : 0}
              className="font-mono text-lg text-primary"
            />
            <span className="text-muted-foreground text-xs ml-1">hits</span>
          </div>
          <div>
            <NumberFlow
              value={ready ? snapshot.cache.misses : 0}
              className="font-mono text-lg"
            />
            <span className="text-muted-foreground text-xs ml-1">miss</span>
          </div>
          <div>
            <NumberFlow
              value={ready ? snapshot.cache.negative_hits : 0}
              className="font-mono text-sm"
            />
            <span className="text-muted-foreground text-xs ml-1">neg</span>
          </div>
          <div>
            <NumberFlow
              value={ready ? snapshot.cache.stale_hits : 0}
              className="font-mono text-sm"
            />
            <span className="text-muted-foreground text-xs ml-1">stale</span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="card p-5 fade-in" style={{ animationDelay: "500ms" }}>
        <div className="flex items-start justify-between mb-2">
          <Tooltip content="Total cache storage size and number of cached keys in memory.">
            <span className="metric-label">Storage</span>
          </Tooltip>
          <HugeiconsIcon
            icon={HardDriveIcon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium font-mono">
          <NumberFlow
            value={ready ? snapshot.cache.storage_mb : 0}
            format={{ maximumFractionDigits: 1 }}
          />
          <span className="text-muted-foreground text-sm ml-1 font-normal">
            MB
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <NumberFlow
            value={ready ? snapshot.cache.keys : 0}
            className="font-mono"
          />{" "}
          keys
        </p>
      </div>
    </section>
  );
}
