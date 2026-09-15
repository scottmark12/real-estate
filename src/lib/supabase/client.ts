import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser Supabase client for use in Client Components (auth forms,
 * direct-to-storage image uploads, etc).
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
