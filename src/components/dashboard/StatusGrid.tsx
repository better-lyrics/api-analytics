import NumberFlow from "@number-flow/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bone01Icon,
  Bone02Icon,
  BrokenBoneIcon,
  ElectricHome02Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  HardDriveIcon,
} from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { DeltaIndicator } from "@/components/ui/DeltaIndicator";
import type { AnalyticsSnapshot, DeltaSnapshot } from "@/types/analytics";
import type { ViewMode } from "@/stores/chartPreferences";

interface StatusGridProps {
  snapshot: AnalyticsSnapshot;
  deltaSum: DeltaSnapshot;
  viewMode: ViewMode;
  ready: boolean;
}

function getCircuitBreakerIcon(state: "CLOSED" | "OPEN" | "HALF_OPEN") {
  switch (state) {
    case "CLOSED":
      return Bone01Icon;
    case "HALF_OPEN":
      return Bone02Icon;
    case "OPEN":
      return BrokenBoneIcon;
  }
}

export function StatusGrid({
  snapshot,
  deltaSum,
  viewMode,
  ready,
}: StatusGridProps) {
  const isDelta = viewMode === "delta";
  const circuitBreakerState = snapshot.circuit_breaker.state;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Circuit Breaker */}
      <div className="card p-5 fade-in" style={{ animationDelay: "350ms" }}>
        <div className="flex items-start justify-between mb-3 mt-0.5">
          <Tooltip content="Protection mechanism that stops requests to failing services. Healthy = normal operation, Tripped = blocking requests, Recovering = testing if service is back.">
            <span className="metric-label">Circuit Breaker</span>
          </Tooltip>
          <HugeiconsIcon
            icon={ElectricHome02Icon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium flex items-center gap-2">
          <HugeiconsIcon
            icon={getCircuitBreakerIcon(circuitBreakerState)}
            className="text-primary"
            size={16}
          />
          <span className="font-mono text-primary">
            {circuitBreakerState === "CLOSED"
              ? "Healthy"
              : circuitBreakerState === "HALF_OPEN"
              ? "Recovering"
              : "Tripped"}
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
        <div className="flex items-start justify-between mb-3 mt-0.5">
          <Tooltip
            content={
              isDelta
                ? "Change in rate-limited requests during selected range"
                : "Requests processed per rate limit tier. Normal tier has stricter limits, cached tier allows more requests."
            }
          >
            <span className="metric-label flex items-center gap-1.5">
              Rate Limit
              <DeltaIndicator show={isDelta} />
            </span>
          </Tooltip>
          <HugeiconsIcon
            icon={DashboardSpeed01Icon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium font-mono">
          <NumberFlow
            value={
              ready
                ? isDelta
                  ? deltaSum.rate_limiting.normal_tier
                  : snapshot.rate_limiting.normal_tier
                : 0
            }
          />
          <span className="text-muted-foreground text-sm ml-1 font-normal">
            normal
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          <NumberFlow
            value={
              ready
                ? isDelta
                  ? deltaSum.rate_limiting.cached_tier
                  : snapshot.rate_limiting.cached_tier
                : 0
            }
            className="font-mono"
          />{" "}
          cached
          {(isDelta
            ? deltaSum.rate_limiting.exceeded > 0
            : snapshot.rate_limiting.exceeded > 0) && (
            <>
              {" "}
              ・{" "}
              <span className="text-primary">
                <NumberFlow
                  value={
                    ready
                      ? isDelta
                        ? deltaSum.rate_limiting.exceeded
                        : snapshot.rate_limiting.exceeded
                      : 0
                  }
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
        <div className="flex items-start justify-between mb-3 mt-0.5">
          <Tooltip
            content={
              isDelta
                ? "Change in cache operations during selected range"
                : "Cache performance: hits (served from cache), miss (fetched fresh), neg (cached 404s), stale (expired but served while refreshing)."
            }
          >
            <span className="metric-label flex items-center gap-1.5">
              Cache Stats
              <DeltaIndicator show={isDelta} />
            </span>
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
              value={
                ready
                  ? isDelta
                    ? deltaSum.cache.hits
                    : snapshot.cache.hits
                  : 0
              }
              className="font-mono text-lg text-primary"
            />
            <span className="text-muted-foreground text-xs ml-1">hits</span>
          </div>
          <div>
            <NumberFlow
              value={
                ready
                  ? isDelta
                    ? deltaSum.cache.misses
                    : snapshot.cache.misses
                  : 0
              }
              className="font-mono text-lg"
            />
            <span className="text-muted-foreground text-xs ml-1">miss</span>
          </div>
          <div>
            <NumberFlow
              value={
                ready
                  ? isDelta
                    ? deltaSum.cache.negative_hits
                    : snapshot.cache.negative_hits
                  : 0
              }
              className="font-mono text-sm"
            />
            <span className="text-muted-foreground text-xs ml-1">neg</span>
          </div>
          <div>
            <NumberFlow
              value={
                ready
                  ? isDelta
                    ? deltaSum.cache.stale_hits
                    : snapshot.cache.stale_hits
                  : 0
              }
              className="font-mono text-sm"
            />
            <span className="text-muted-foreground text-xs ml-1">stale</span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="card p-5 fade-in" style={{ animationDelay: "500ms" }}>
        <div className="flex items-start justify-between mb-3 mt-0.5">
          <Tooltip
            content={
              isDelta
                ? "Change in storage size and keys during selected range"
                : "Total cache storage size and number of cached keys in memory."
            }
          >
            <span className="metric-label flex items-center gap-1.5">
              Storage
              <DeltaIndicator show={isDelta} />
            </span>
          </Tooltip>
          <HugeiconsIcon
            icon={HardDriveIcon}
            className="text-primary"
            size={18}
          />
        </div>
        <p className="text-lg font-medium font-mono">
          <NumberFlow
            value={
              ready
                ? isDelta
                  ? deltaSum.storage.storage_mb
                  : snapshot.cache.storage_mb
                : 0
            }
            format={{ maximumFractionDigits: 1 }}
          />
          <span className="text-muted-foreground text-sm ml-1 font-normal">
            MB
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          <NumberFlow
            value={
              ready ? (isDelta ? deltaSum.storage.keys : snapshot.cache.keys) : 0
            }
            className="font-mono"
          />{" "}
          keys
        </p>
      </div>
    </section>
  );
}
