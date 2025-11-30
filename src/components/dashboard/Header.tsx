import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
  isSystemHealthy: boolean;
}

export function Header({ isSystemHealthy }: HeaderProps) {
  return (
    <header className="mb-10 pb-6 border-b border-primary/20 glow-line fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-primary">
            <Logo />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-satoshi">
              Better Lyrics
            </h1>
            <p className="text-muted-foreground text-[10px] mt-1 font-mono tracking-[0.25em] uppercase">
              API Analytics
            </p>
          </div>
        </div>
        <div className="status-badge">
          <span
            className={`w-1.5 h-1.5 ${
              isSystemHealthy ? "bg-primary" : "bg-primary animate-pulse"
            }`}
          />
          <span className="font-mono">
            {isSystemHealthy ? "SYSTEM ONLINE" : "DEGRADED"}
          </span>
        </div>
      </div>
    </header>
  );
}
