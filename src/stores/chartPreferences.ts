import { create } from "zustand";
import { persist } from "zustand/middleware";

// -- Types --------------------------------------------------------------------

type TrafficChartType = "area" | "bar" | "scatter";
type AgentsChartType = "bar" | "pie";

interface ChartPreferencesState {
  trafficChartType: TrafficChartType;
  agentsChartType: AgentsChartType;
  setTrafficChartType: (type: TrafficChartType) => void;
  setAgentsChartType: (type: AgentsChartType) => void;
}

// -- Store --------------------------------------------------------------------

export const useChartPreferences = create<ChartPreferencesState>()(
  persist(
    (set) => ({
      trafficChartType: "area",
      agentsChartType: "bar",
      setTrafficChartType: (type) => set({ trafficChartType: type }),
      setAgentsChartType: (type) => set({ agentsChartType: type }),
    }),
    {
      name: "chart-preferences",
    }
  )
);
