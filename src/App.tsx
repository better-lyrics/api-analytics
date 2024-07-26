import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { XAxis, CartesianGrid, Area, AreaChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CountData {
  date: string;
  lyrics_count: number;
  track_count: number;
  number_of_keys: number;
  size_in_kb: number;
}

async function fetchCounts(): Promise<CountData[]> {
  const { data, error } = await supabase
    .from("counts")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }

  return data;
}

const chartConfig = {
  lyrics_count: {
    label: "Lyrics Count",
    color: "hsl(var(--chart-1))",
  },
  track_count: {
    label: "Track Count",
    color: "hsl(var(--chart-2))",
  },
  number_of_keys: {
    label: "Number of Keys",
    color: "hsl(var(--chart-3))",
  },
  size_in_kb: {
    label: "Size in KB",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function App() {
  const { data, isLoading, isError, error } = useQuery<CountData[], Error>({
    queryKey: ["counts"],
    queryFn: fetchCounts,
  });

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (isError) {
    return <div className="container mx-auto p-4">Error: {error.message}</div>;
  }

  return (
    <>
      <nav className="fixed p-4 w-full">
        <h1 className="text-2xl font-bold">Better Lyrics Analytics</h1>
      </nav>
      <div className="h-screen w-full grid place-items-center">
        <Card className="min-w-[75%]">
          <CardHeader>
            <CardTitle>Lyrics and Track Count Trends</CardTitle>
            <CardDescription>
              Showing lyrics and track counts over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={data}
                margin={{
                  left: 0,
                  right: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDate}
                />
                <ChartTooltip
                  labelFormatter={formatDate}
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient id="fillLyrics" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-lyrics_count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-lyrics_count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillTracks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-track_count)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-track_count)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillKeys" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-number_of_keys)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-number_of_keys)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillSize" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-size_in_kb)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-size_in_kb)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="lyrics_count"
                  type="natural"
                  fill="url(#fillLyrics)"
                  fillOpacity={0.4}
                  stroke="var(--color-lyrics_count)"
                  stackId="a"
                />
                <Area
                  dataKey="track_count"
                  type="natural"
                  fill="url(#fillTracks)"
                  fillOpacity={0.4}
                  stroke="var(--color-track_count)"
                  stackId="a"
                />
                <Area
                  dataKey="number_of_keys"
                  type="natural"
                  fill="url(#fillKeys)"
                  fillOpacity={0.4}
                  stroke="var(--color-number_of_keys)"
                  stackId="a"
                />
                <Area
                  dataKey="size_in_kb"
                  type="natural"
                  fill="url(#fillSize)"
                  fillOpacity={0.4}
                  stroke="var(--color-size_in_kb)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
