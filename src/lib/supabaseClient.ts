import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Lazy singleton so mock mode never touches (or requires) the Supabase env vars.
// Only called from code paths already guarded by dataSource === "supabase".
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "VITE_DATA_SOURCE=supabase but VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — add them to .env.local"
    );
  }
  client = createClient(url, anonKey);
  return client;
}
