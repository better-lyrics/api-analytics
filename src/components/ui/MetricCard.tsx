import NumberFlow from "@number-flow/react";
import { Tooltip } from "@/components/ui/Tooltip";
import { DeltaIndicator } from "@/components/ui/DeltaIndicator";
import type { MetricCardProps } from "@/types/analytics";

export function MetricCard({
  label,
  value,
  suffix,
  subtext,
  icon,
  delay = 0,
  tooltip,
  showDelta = false,
}: MetricCardProps) {
  return (
    <div
      className="card card-hover p-5 fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        {tooltip ? (
          <Tooltip content={tooltip}>
            <span className="metric-label flex items-center gap-1.5">
              {label}
              <DeltaIndicator show={showDelta} />
            </span>
          </Tooltip>
        ) : (
          <p className="metric-label flex items-center gap-1.5">
            {label}
            <DeltaIndicator show={showDelta} />
          </p>
        )}
        <div className="text-primary">{icon}</div>
      </div>
      <p className="metric-value font-mono text-primary">
        {typeof value === "number" ? <NumberFlow value={value} /> : value}
        {suffix && (
          <span className="text-sm text-muted-foreground ml-1 font-normal">
            {suffix}
          </span>
        )}
      </p>
      {subtext && (
        <p className="text-[11px] text-muted-foreground mt-3 font-mono">
          {subtext}
        </p>
      )}
    </div>
  );
}
