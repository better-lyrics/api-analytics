import { create } from "zustand";
import { persist } from "zustand/middleware";

// -- Types --------------------------------------------------------------------

type TrafficChartType = "area" | "bar" | "scatter";
type AgentsChartType = "bar" | "pie";
export type ViewMode = "total" | "delta";
export type TimeRange = "6h" | "12h" | "24h" | "7d" | "30d" | "all";

interface ChartPreferencesState {
  trafficChartType: TrafficChartType;
  agentsChartType: AgentsChartType;
  viewMode: ViewMode;
  timeRange: TimeRange;
  setTrafficChartType: (type: TrafficChartType) => void;
  setAgentsChartType: (type: AgentsChartType) => void;
  setViewMode: (mode: ViewMode) => void;
  setTimeRange: (range: TimeRange) => void;
}

// -- Store --------------------------------------------------------------------

export const useChartPreferences = create<ChartPreferencesState>()(
  persist(
    (set) => ({
      trafficChartType: "area",
      agentsChartType: "bar",
      viewMode: "total",
      timeRange: "all",
      setTrafficChartType: (type) => set({ trafficChartType: type }),
      setAgentsChartType: (type) => set({ agentsChartType: type }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setTimeRange: (range) => set({ timeRange: range }),
    }),
    {
      name: "chart-preferences",
    }
  )
);
