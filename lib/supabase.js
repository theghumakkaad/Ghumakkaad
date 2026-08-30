import { createClient } from "@supabase/supabase-js";

/* ============================================================
   The browser's connection to Supabase.

   Public and read-only by policy. Safe to ship to the browser: row level
   security limits this key to reading active packages, and only lets a
   signed-in user write.

   TWO KEY NAMES ARE ACCEPTED, on purpose.

   Supabase renamed the browser key: the legacy JWT was the "anon key", the
   current one is the "publishable key" (sb_publishable_...). Both work with
   createClient. More to the point, when Supabase is connected to Vercel
   through the marketplace integration, the variables it writes for you are
   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NOT
   ANON_KEY.

   Reading only one of those names is a nasty way to fail, because nothing
   errors: hasSupabase comes out false, the site quietly serves the content
   bundled in lib/trips.js, and the admin panel looks fine while changing
   nothing anyone can see. "Why are my edits not showing", with no error
   message anywhere to explain it. So either name is accepted here.
   ============================================================ */

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabase = Boolean(supabaseUrl && supabaseKey);

/* Said once, on the server, so it lands in the deploy log. Falling back to
   bundled content is a feature; doing it silently on a live site is not, so
   this names exactly which variable is missing. */
if (!hasSupabase && typeof window === "undefined") {
  const missing = [
    supabaseUrl ? null : "NEXT_PUBLIC_SUPABASE_URL",
    supabaseKey ? null : "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
  ].filter(Boolean);
  console.warn(
    `[Ghumakkaad] Supabase is not configured: ${missing.join(", ")} not set. ` +
    "Serving the content bundled in lib/trips.js. Admin edits will NOT appear on the site."
  );
}

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseKey)
  : null;
