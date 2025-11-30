import { useQuery } from "@tanstack/react-query";
import { supabase, REFETCH_INTERVAL_MS } from "@/lib/supabase";
import { transformApiResponse } from "@/utils/transforms";
import type { AnalyticsRow, AnalyticsSnapshot } from "@/types/analytics";

async function fetchAnalytics(): Promise<AnalyticsSnapshot> {
  const { data, error } = await supabase
    .from("analytics")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1)
    .single<AnalyticsRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("No data available");
  }

  return transformApiResponse(data);
}

export function useAnalytics() {
  return useQuery<AnalyticsSnapshot>({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}
