# Ghumakkaad

Next.js 14, App Router, plain JavaScript. Every trip page is prerendered
static HTML with its own metadata and structured data.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start    # production build
```

## Deploy

Push to GitHub and import the repo at vercel.com/new — Next.js is detected
automatically, no configuration needed. Or:

```bash
npx vercel --prod
```

## Routes

```
/                              the journey landing page
/packages                      all trips + next departures
/packages/[slug]               one page per trip, prerendered
/admin                         content editor (noindex)
/privacy  /terms  /refund-policy   legal pages, linked from every footer
/sitemap.xml  /robots.txt  /manifest.webmanifest   generated from the content
```

## Content

Everything lives in `lib/trips.js` — trips, itineraries, fares, dates,
inclusions, cancellation terms, questions and background scenes.

Add a trip to that file and it appears on the home page, the packages
page, the sitemap, and gets its own prerendered page at
`/packages/your-slug`. Nothing else to wire up.

## Supabase — live editing

### 1. Create a project

New project at supabase.com. Then **SQL Editor → New query**:

1. Paste `supabase/schema.sql`, run it. Creates the tables and the
   security rules.
2. Paste `supabase/seed.sql`, run it. Loads the three trips with the
   corrected brochure prices, itineraries and dates.
3. Paste `supabase/002_restrict_admin_access.sql`, run it. `schema.sql`
   on its own lets **any** signed-in account edit everything — fine for
   a brand-new project, but worth closing immediately. This migration
   adds an `admins` table and scopes every write policy to it; the file
   itself has the two follow-up steps (add your own user id, turn off
   public sign-ups in Authentication settings).

### 2. Create your login

**Authentication → Users → Add user.** Use your own email and a real
password, and tick *Auto Confirm*. This is the account you will sign in
to `/admin` with. Then run step 3 above if you haven't yet, and add
this account's user id to the `admins` table the way that file
describes — until you do, this account can sign in but can't save
anything, which is the point.

### 3. Connect the site

**Project Settings → API**, copy the Project URL and the `anon` key into
`.env.local` (copy `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Add the same two variables in Vercel under Settings → Environment
Variables before deploying.

### How editing works now

Sign in at `/admin`, change a price or add a departure, hit Save. It goes
straight into Supabase. Pages refresh themselves every 5 minutes
(`revalidate = 300`), so the change appears on the live site without a
redeploy. No export, no commit.

**Why the anon key is safe in the browser:** row level security lets it
read active packages and nothing else. Every write requires a signed-in
session. Someone reading your page source gets a key that cannot change a
single price.

**If Supabase is unreachable** — or you have not set it up yet — the site
falls back to the content bundled in `lib/trips.js`, so it never breaks.

## Admin

`/admin`. The packages list has View / Edit / Delete and **+ New
Package**. The edit form covers basics, day-by-day itinerary (add, remove,
reorder), pricing tiers, departure dates with a Seasonal tick, inclusions,
notes, pickup points, packing, cancellation, questions and backgrounds.

## SEO

- Per-page title, description, canonical, Open Graph and Twitter tags
- `TravelAgency` schema site-wide; `TouristTrip` + `Offer` +
  `BreadcrumbList` + `FAQPage` on every trip (the last two only appear
  once a trip actually has a price and questions, so nothing empty or
  invalid gets emitted)
- Prices, dates and full itineraries are in the HTML, not loaded by JS
- `sitemap.xml`, `robots.txt` and `manifest.webmanifest` generated from
  the trip list
- Security headers (`next.config.mjs`) and `lang="en-IN"` for Lighthouse
  Best Practices

## Google Search Console

1. [search.google.com/search-console](https://search.google.com/search-console) → **Add property** → paste your
   domain.
2. Pick **HTML tag** as the verification method (not the file-upload
   method — the tag does the same job without adding a file to the
   repo). Copy just the `content="..."` value out of the tag it shows
   you.
3. Set `NEXT_PUBLIC_GSC_VERIFICATION` to that value in `.env.local` and
   in Vercel, redeploy, then click **Verify** back in Search Console.
4. Once verified: **Sitemaps** → submit `sitemap.xml`. Search Console
   will start showing you what Google has indexed and any Rich
   Results issues within a few days.

## Analytics

Set `NEXT_PUBLIC_GA_ID` (from analytics.google.com → Admin → Data
Streams) in `.env.local` and Vercel to turn on Google Analytics 4.
Every WhatsApp, call and email link on the site already fires a
`whatsapp_click` / `phone_click` / `email_click` event with the trip
name and which part of the page it was clicked from — visible under
Analytics → Reports → Engagement → Events once traffic comes in.
Leave the variable blank and none of this loads: no script, no
request, no cookie.

## Before launch

- Create your Supabase user, add it to the `admins` table (see
  Supabase step 3 above), and turn off public sign-ups in Supabase
  Auth settings
- Set your real domain in `site.url` inside `lib/trips.js` — every
  canonical URL and schema id is built from it
- Replace the Wikimedia photos with your own trip photos. They are
  CC BY-SA and need crediting; source URLs are in each trip's `scenes`.
  `/privacy` has a line acknowledging Unsplash/Wikimedia/Mixkit sourcing
  until you do
- Self-host the video clips instead of hotlinking Mixkit
- Read `/privacy`, `/terms` and `/refund-policy` and adjust anything
  specific to how you actually take payment — they're written from how
  the site behaves today, but haven't been reviewed by a lawyer
- Set `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_GSC_VERIFICATION` (see above)
