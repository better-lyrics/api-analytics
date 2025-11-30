import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATS_API_URL = Deno.env.get("STATS_API_URL")!;
const STATS_API_KEY = Deno.env.get("STATS_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");

  if (expectedSecret && cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch stats from API
    const statsResponse = await fetch(STATS_API_URL, {
      headers: { Authorization: STATS_API_KEY },
    });

    if (!statsResponse.ok) {
      throw new Error(`Stats API returned ${statsResponse.status}`);
    }

    const statsData = await statsResponse.json();

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert into analytics table
    const { error } = await supabase.from("analytics").insert({
      data: statsData,
    });

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, timestamp: new Date().toISOString() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
