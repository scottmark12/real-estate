import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Note: Next.js 16 renamed `middleware.ts` to `proxy.ts` (same behavior,
// see node_modules/next/dist/docs/.../proxy.md). This file replaces the
// `src/middleware.ts` named in the build brief.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Only the admin needs the session check. Running it on public pages cost
// an auth round trip on every visit and stopped them from being cached.
export const config = {
  matcher: ["/admin/:path*"],
};
