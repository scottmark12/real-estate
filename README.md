# Mark Scott Real Estate

A Next.js (App Router) real estate marketing site for Mark Scott Real Estate
(San Diego), backed by Supabase. Public content — listings, articles, hero
copy, the market chart, services, the pull quote, and contact/footer info —
is all stored in Supabase and edited from the built-in admin panel. Every
public page fetches live (`revalidate = 0`), so admin edits show up on the
site immediately, with no redeploy required.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Environment variables live in `.env.local` (already populated with the
project's real Supabase URL and anon key). `.env.example` shows the shape for
a fresh setup:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Both are safe to expose to the browser — the anon key only ever has the
access granted by the database's Row Level Security policies (public read of
published content; writes require a signed-in `authenticated` user).

## Adding an admin user

There is no public sign-up page — that's intentional. To create an account
for Mark (or anyone else who should manage the site):

1. Go to the Supabase Dashboard → **Authentication → Users**.
2. Click **Add user** → **Create new user**, enter an email and password,
   and make sure "Auto Confirm User" is checked.
3. Sign in at `/admin/login` with that email/password.

Every `/admin/*` route other than `/admin/login` requires a signed-in
session (enforced in `src/proxy.ts`).

## Using the admin panel

- **`/admin/listings`** — table of every listing (published or not), with
  inline Published/Featured toggles, edit, delete, and "+ New Listing".
- **`/admin/listings/new`** / **`/admin/listings/[id]/edit`** — full form
  covering every `listings` column. Image and gallery fields upload directly
  to the `site-images` Supabase Storage bucket from the browser and store the
  resulting public URL.
- **`/admin/articles`** and its new/edit forms — same pattern for the
  `articles` table, including the "Feature Story" and "Market Report" flags
  that control the homepage's navy feature block and "The Market, Right Now"
  section.
- **`/admin/settings`** — typed forms (not raw JSON) for the `site_settings`
  rows that drive the rest of the homepage: hero headline/image, the market
  chart's data series, the three "How I Can Help" columns, the about/pull
  quote block, the newsletter band, and footer/contact details.

Saving any of these calls a Server Action that writes to Supabase and calls
`revalidatePath` for the affected public routes, so changes are visible on
the live site as soon as you save.

## Deploying to Vercel

1. Push this repo to GitHub (or your Git host of choice) and import it into
   Vercel.
2. In the Vercel project's **Settings → Environment Variables**, add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the
   same values as `.env.local` (for every environment: Production, Preview,
   Development).
3. Deploy. No build-time database access is required — every page fetches
   at request time.

## Notes on placeholder content

Seed data (4 listings, 4 articles, and the `site_settings` rows) uses
placeholder photos from Unsplash. Replace them from the admin panel
whenever real photography is ready — uploads go straight to the
`site-images` Storage bucket.

## Tech notes

- Data access uses `@supabase/ssr`'s `createServerClient` /
  `createBrowserClient` (not the deprecated `auth-helpers` package).
- This project runs on Next.js 16, which renamed `middleware.ts` to
  `proxy.ts` (same behavior, new name/export) — see `src/proxy.ts`.
- Article bodies are Markdown, rendered with `marked`.
- The homepage's "Market, Right Now" line chart is a small hand-rolled
  inline SVG component (`src/components/market-chart.tsx`) rather than a
  charting library, per the brief's "dependency-light" guidance.
