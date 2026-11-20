import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Listing alerts",
  robots: { index: false },
};

export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/alerts/unsubscribe">) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : "";
  let done = false;
  if (/^[0-9a-f-]{36}$/i.test(token)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("alerts_unsubscribe", { p_token: token });
    done = data === true;
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="eyebrow text-gold">Listing alerts</p>
      <h1 className="mt-3 font-georgia text-[36px] leading-tight text-navy">
        {done ? "You're unsubscribed." : "That link has already been used."}
      </h1>
      <p className="mt-4 text-navy/70">
        {done
          ? "You won't get any more emails for that search. Changed your mind? Set up a new one any time."
          : "If you're still getting emails, reply to one and I'll take care of it."}
      </p>
      <Link
        href="/buy"
        className="mt-8 inline-block bg-ink px-6 py-3 text-sm font-semibold text-white"
      >
        Browse homes
      </Link>
    </div>
  );
}
