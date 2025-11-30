import type { TooltipProps } from "@/types/analytics";

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="tooltip-trigger">
      {children}
      <span className="tooltip-content">{content}</span>
    </span>
  );
}
