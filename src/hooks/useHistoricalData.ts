import { useQuery } from "@tanstack/react-query";
import { supabase, REFETCH_INTERVAL_MS } from "@/lib/supabase";
import { transformApiResponse } from "@/utils/transforms";
import type { AnalyticsRow, HistoricalDataPoint } from "@/types/analytics";

async function fetchHistoricalData(): Promise<HistoricalDataPoint[]> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .order("timestamp", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row: AnalyticsRow) => {
    const date = new Date(row.timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      snapshot: transformApiResponse(row),
    };
  });
}

export function useHistoricalData() {
  return useQuery<HistoricalDataPoint[]>({
    queryKey: ["historical"],
    queryFn: fetchHistoricalData,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
