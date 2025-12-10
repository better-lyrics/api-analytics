import NumberFlow from "@number-flow/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics02Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { MetricCard } from "@/components/ui/MetricCard";
import type { AnalyticsSnapshot, DeltaSnapshot } from "@/types/analytics";
import type { ViewMode } from "@/stores/chartPreferences";

interface MetricsGridProps {
  snapshot: AnalyticsSnapshot;
  deltaSum: DeltaSnapshot;
  viewMode: ViewMode;
  ready: boolean;
}

export function MetricsGrid({
  snapshot,
  deltaSum,
  viewMode,
  ready,
}: MetricsGridProps) {
  const isDelta = viewMode === "delta";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="Requests"
        value={isDelta ? deltaSum.requests.total : snapshot.requests.total}
        subtext={
          isDelta ? (
            <>In selected time range</>
          ) : (
            <>
              <NumberFlow value={ready ? snapshot.requests.per_hour : 0} />
              /hr
            </>
          )
        }
        icon={<HugeiconsIcon icon={Analytics02Icon} size={18} />}
        delay={50}
        tooltip={
          isDelta
            ? "Change in requests during selected time range"
            : "Total number of API requests received since server start"
        }
        showDelta={isDelta}
      />
      <MetricCard
        label="Latency"
        value={snapshot.response_times.avg}
        suffix="ms"
        subtext={
          <>
            Lyrics:{" "}
            <NumberFlow
              value={ready ? snapshot.response_times.avg_lyrics : 0}
            />
            ms | Max:{" "}
            <NumberFlow
              value={ready ? snapshot.response_times.max / 1000 : 0}
              format={{ maximumFractionDigits: 1 }}
            />
            s
          </>
        }
        icon={<HugeiconsIcon icon={DashboardSpeed01Icon} size={18} />}
        delay={100}
        tooltip="Average response time across all API endpoints"
      />
      <MetricCard
        label={isDelta ? "Cache Hits" : "Cache"}
        value={isDelta ? deltaSum.cache.hits : snapshot.cache.hit_rate}
        suffix={isDelta ? "" : "%"}
        subtext={
          isDelta ? (
            <>
              <NumberFlow value={ready ? deltaSum.cache.misses : 0} /> misses
            </>
          ) : (
            <>
              <NumberFlow
                value={ready ? snapshot.cache.storage_mb : 0}
                format={{ maximumFractionDigits: 1 }}
              />{" "}
              MB
            </>
          )
        }
        icon={<HugeiconsIcon icon={Database01Icon} size={18} />}
        delay={150}
        tooltip={
          isDelta
            ? "Change in cache hits during selected time range"
            : "Percentage of requests served from cache instead of fetching fresh data"
        }
        showDelta={isDelta}
      />
      <MetricCard
        label="Uptime"
        value={
          <>
            <NumberFlow
              value={
                ready ? Math.floor(snapshot.server.uptime_seconds / 3600) : 0
              }
            />
            <span className="text-sm text-muted-foreground ml-1 font-normal">
              h{" "}
            </span>
            <NumberFlow
              value={
                ready
                  ? Math.floor((snapshot.server.uptime_seconds % 3600) / 60)
                  : 0
              }
            />
            <span className="text-sm text-muted-foreground ml-1 font-normal">
              m{" "}
            </span>
            <NumberFlow
              value={
                ready ? Math.floor(snapshot.server.uptime_seconds % 60) : 0
              }
            />
            <span className="text-sm text-muted-foreground ml-1 font-normal">
              s
            </span>
          </>
        }
        subtext={
          <>Since {new Date(snapshot.server.start_time).toLocaleDateString()}</>
        }
        icon={<HugeiconsIcon icon={Time01Icon} size={18} />}
        delay={200}
        tooltip="Time elapsed since the API server was last started"
      />
    </section>
  );
}
