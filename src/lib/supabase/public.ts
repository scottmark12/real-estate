import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cookie free Supabase client for public reads (articles, settings).
 * Reading cookies forces a page to render on every request; this client
 * doesn't, so public pages can be cached and served from the edge.
 * Row level security still applies, so it only sees what anon can see.
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
