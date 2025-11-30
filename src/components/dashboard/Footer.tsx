import type { HistoricalDataPoint } from "@/types/analytics";

interface FooterProps {
  hoveredPoint: HistoricalDataPoint | null;
  latestTimestamp: string;
}

export function Footer({ hoveredPoint, latestTimestamp }: FooterProps) {
  return (
    <footer
      className="mt-8 pt-4 border-t border-border text-[10px] text-muted-foreground flex justify-between items-center fade-in"
      style={{ animationDelay: "550ms" }}
    >
      <span className="font-mono tracking-wider">
        {hoveredPoint
          ? `VIEWING: ${hoveredPoint.date}`
          : `LAST UPDATE: ${new Date(latestTimestamp).toLocaleTimeString()}`}
      </span>
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
