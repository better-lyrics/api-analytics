import type { HistoricalDataPoint } from "@/types/analytics";
import type { DeltaDataPoint } from "@/utils/transforms";

interface FooterProps {
  hoveredPoint: HistoricalDataPoint | null;
  hoveredDelta: DeltaDataPoint | null;
  pinnedPoint: HistoricalDataPoint | null;
  pinnedDelta: DeltaDataPoint | null;
  latestTimestamp: string;
}

export function Footer({
  hoveredPoint,
  hoveredDelta,
  pinnedPoint,
  pinnedDelta,
  latestTimestamp,
}: FooterProps) {
  const pinnedDate = pinnedPoint?.date ?? pinnedDelta?.date;
  const viewingDate = hoveredPoint?.date ?? hoveredDelta?.date;

  const getStatusText = () => {
    if (pinnedDate) return `PINNED: ${pinnedDate}`;
    if (viewingDate) return `VIEWING: ${viewingDate}`;
    return `LAST UPDATE: ${new Date(latestTimestamp).toLocaleTimeString()}`;
  };

  return (
    <footer
      className="mt-8 pt-4 border-t border-border text-[10px] text-muted-foreground flex justify-between items-center fade-in"
      style={{ animationDelay: "550ms" }}
    >
      <span className="font-mono tracking-wider">{getStatusText()}</span>
      <a
        href="https://better-lyrics.boidu.dev/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono tracking-wider hover:text-primary transition-colors text-right"
      >
        &copy; {new Date().getFullYear()} Better Lyrics. All Rights Reserved.
      </a>
    </footer>
  );
}
