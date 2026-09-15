import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Note: Next.js 16 renamed `middleware.ts` to `proxy.ts` (same behavior,
// see node_modules/next/dist/docs/.../proxy.md). This file replaces the
// `src/middleware.ts` named in the build brief.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
