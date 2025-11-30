import { createClient } from "@supabase/supabase-js";

// -- Constants -----------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const REFETCH_INTERVAL_MS = 30000;
export const MOBILE_BREAKPOINT = 640;
export const ANIMATION_READY_DELAY_MS = 300;
