import NumberFlow from "@number-flow/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Analytics02Icon } from "@hugeicons/core-free-icons";
import { Tooltip } from "@/components/ui/Tooltip";
import { DeltaIndicator } from "@/components/ui/DeltaIndicator";
import type { AnalyticsSnapshot, DeltaSnapshot } from "@/types/analytics";
import type { ViewMode } from "@/stores/chartPreferences";

interface RequestsBreakdownProps {
  snapshot: AnalyticsSnapshot;
  deltaSum: DeltaSnapshot;
  viewMode: ViewMode;
  ready: boolean;
}

const REQUEST_ITEMS = [
  { key: "lyrics" as const, label: "Lyrics", tooltip: "Requests for song lyrics" },
  { key: "cache" as const, label: "Cache", tooltip: "Direct cache lookup requests" },
  { key: "health" as const, label: "Health", tooltip: "Health check endpoint calls" },
  { key: "stats" as const, label: "Stats", tooltip: "Statistics endpoint calls" },
  { key: "other" as const, label: "Other", tooltip: "Miscellaneous requests" },
];

export function RequestsBreakdown({
  snapshot,
  deltaSum,
  viewMode,
  ready,
}: RequestsBreakdownProps) {
  const isDelta = viewMode === "delta";

  return (
    <div className="card p-5 fade-in" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center gap-3 mb-5">
        <HugeiconsIcon
          icon={Analytics02Icon}
          size={16}
          className="text-primary"
        />
        <Tooltip
          content={
            isDelta
              ? "Change in requests by endpoint type during selected range"
              : "Breakdown of requests by endpoint type"
          }
        >
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
            Requests
            <DeltaIndicator show={isDelta} />
          </h3>
        </Tooltip>
      </div>
      <div className="space-y-3">
        {REQUEST_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <Tooltip content={item.tooltip}>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </Tooltip>
            <NumberFlow
              value={
                ready
                  ? isDelta
                    ? deltaSum.requests[item.key]
                    : snapshot.requests[item.key]
                  : 0
              }
              className="font-mono text-sm"
            />
          </div>
        ))}
        {!isDelta && (
          <div className="border-t border-border pt-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Per Hour
                </p>
                <p className="font-mono text-lg">
                  <NumberFlow value={ready ? snapshot.requests.per_hour : 0} />
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Per Min
                </p>
                <p className="font-mono text-lg">
                  <NumberFlow value={ready ? snapshot.requests.per_minute : 0} />
                </p>
              </div>
            </div>
          </div>
        )}
        {isDelta && (
          <div className="border-t border-border pt-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Total Delta
                </p>
                <p className="font-mono text-lg">
                  <NumberFlow value={ready ? deltaSum.requests.total : 0} />
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  2xx Delta
                </p>
                <p className="font-mono text-lg">
                  <NumberFlow value={ready ? deltaSum.responses["2xx"] : 0} />
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
