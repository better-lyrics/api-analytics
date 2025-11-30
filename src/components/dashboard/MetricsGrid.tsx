import NumberFlow from "@number-flow/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics02Icon,
  DashboardSpeed01Icon,
  Database01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { MetricCard } from "@/components/ui/MetricCard";
import type { AnalyticsSnapshot } from "@/types/analytics";

interface MetricsGridProps {
  snapshot: AnalyticsSnapshot;
  ready: boolean;
}

export function MetricsGrid({ snapshot, ready }: MetricsGridProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        label="Requests"
        value={snapshot.requests.total}
        subtext={
          <>
            <NumberFlow value={ready ? snapshot.requests.per_hour : 0} />
            /hr
          </>
        }
        icon={<HugeiconsIcon icon={Analytics02Icon} size={18} />}
        delay={50}
        tooltip="Total number of API requests received since server start"
      />
      <MetricCard
        label="Latency"
        value={snapshot.response_times.avg}
        suffix="ms"
        subtext={
          <>
            Lyrics:{" "}
            <NumberFlow value={ready ? snapshot.response_times.avg_lyrics : 0} />
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
        label="Cache"
        value={snapshot.cache.hit_rate}
        suffix="%"
        subtext={
          <>
            <NumberFlow
              value={ready ? snapshot.cache.storage_mb : 0}
              format={{ maximumFractionDigits: 1 }}
            />{" "}
            MB
          </>
        }
        icon={<HugeiconsIcon icon={Database01Icon} size={18} />}
        delay={150}
        tooltip="Percentage of requests served from cache instead of fetching fresh data"
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
              value={ready ? Math.floor(snapshot.server.uptime_seconds % 60) : 0}
            />
            <span className="text-sm text-muted-foreground ml-1 font-normal">
              s
            </span>
          </>
        }
        subtext={
          <>Since {new Date(snapshot.server.start_time).toLocaleDateString()}</>
        }
        icon={<HugeiconsIcon icon={Clock01Icon} size={18} />}
        delay={200}
        tooltip="Time elapsed since the API server was last started"
      />
    </section>
  );
}
