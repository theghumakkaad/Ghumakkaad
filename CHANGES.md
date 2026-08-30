# Ghumakkaad — what changed

A polish-and-repair pass, 17 August 2026. The brand is deliberately unchanged:
same near-black cinema backdrop, same amber accent, same Alfa Slab One display
face, same seasonal scroll journey. Routes, slugs, nav labels and structured
data are all untouched, so nothing moves for search engines.

**Before you run it:** `npm install`. There are four new dependencies.

---

## New dependencies

| Package | Why |
| --- | --- |
| `motion` | Animation library (`motion/react`, current name for Framer Motion) |
| `@fontsource/alfa-slab-one` | Display face, self-hosted |
| `@fontsource-variable/baloo-2` | Body face, self-hosted |
| `@fontsource/dm-mono` | Mono face, self-hosted |

---

## Bugs fixed

### The fonts were never loading reliably

`layout.jsx` pulled all three faces from `fonts.googleapis.com` through a
render-blocking `<link>`. They now ship from your own origin as woff2, each
carrying a `unicode-range`, so an English page only downloads the latin subset.
This resolves the `TODO` that was sitting at the top of `layout.jsx`.

Worth knowing: this is the single biggest visual difference in the pass. Until
the font loaded, every heading fell back to Georgia.

### The landing page leaked on every navigation away

`Journey.jsx` started a `requestAnimationFrame` loop that re-queued itself
unconditionally. The old cleanup set a `running = false` flag, which stopped the
particle drawing but not the loop, so `measure()` kept running against detached
DOM nodes forever. Alongside it: a `setInterval(pullWeather, 15 * 60 * 1000)`
that was never cleared, and three `IntersectionObserver`s never disconnected.

Now `cancelAnimationFrame`, `clearInterval`, an `AbortController` on both
fetches, and video elements released. Measured: 0 frames in the 3 seconds after
leaving the page, 0 `<video>` nodes left behind.

### Admin text was injected as markup

`renderPackages()` built cards as an HTML string and assigned them with
`innerHTML`, interpolating `p.name` and `p.blurb` straight in. Any angle bracket
typed into the admin became live markup. Cards are React elements now, and the
`window.__TRIPS` / `window.__SITE` globals that fed them are gone.

### The home page advertised departures that had already left

`upcomingDates()` ended with `return up.length ? up : t.dates || []` — when
nothing was upcoming it handed back the full history. The home board was showing
**25 Jun** on 17 August. It returns only future dates now, sorted, and every
caller already handled an empty list.

### Eight dead links in the footer

Four links (`Common questions`, `Booking terms`, `Cancellation policy`,
`Privacy`) all pointed at `#outro`, an anchor on the same page. Four more
(`/packages?type=snow` and friends) pointed at a query parameter nothing read.

The terrain filter is now real and wired to `?terrain=`, and the four invented
pages are replaced by a line stating the truth: those details live on each trip
page.

### Wrong contact details

The footer offered `hello@ghumakkaad.com`. Your actual address, in
`site.email`, is `theghumakkaad@gmail.com`. Now read from config, as is the
phone number. The Instagram link pointed at bare `instagram.com/`; it is now
conditional on a `site.instagram` field, so it appears once you add a handle
rather than shipping a dead link.

### Every Book button used a stale WhatsApp number

`waLink()` in `lib/trips.js` read `site.whatsapp` from the bundled file, so
changing the number in the admin left every button on the old one. Components
take the number as a prop from `getSite()` now, and `waLink` is deleted rather
than left quietly wrong.

### `₹∞`

`fromPrice()` was `Math.min(...fares.map(...))`, and `Math.min()` of an empty
list is `Infinity`. Any trip whose fares were not filled in yet rendered as
`₹∞`. Returns `null` now.

### The letter-fold animation ran on every heading

`useJourney.js` selected `main h2` and split each one into per-character spans,
so "What you get", "Pack this" and "Questions" were also measured on every
scroll frame. Worse: on a remount the `if (h.dataset.kin) return` guard skipped
the already-wrapped headings, leaving them stranded at 6% opacity permanently.

Scoped to `.day h2`. Original text is stored and restored on cleanup, so React
is never handed foreign DOM. Panel headings take the ordinary `.pre` fade.

### The day track re-rendered 60 times a second

`DayTrack` called `setFill()` on every scroll frame, pushing a full React render
each time. The fill is a Motion value now, and it animates `scaleX` rather than
`width`, keeping it off the layout path.

### "SCROLL" sat on top of a departures row

`.scroll-hint` was absolutely positioned into the same space as the board on
narrow viewports. Removed entirely — a reader looking at the hero already knows
what scrolling is.

### The masthead went muddy over light cards

`mix-blend-mode: difference` inverted the wordmark against whatever passed
beneath it, which meant near-white trip cards turned it grey. Replaced with a
top scrim gradient, so the nav has a guaranteed background in both cases.

### The itinerary reel read as a rendering fault

`.acts-window` sat `.85rem` below the heading with a 16% top fade, so the
outgoing line overlapped the heading's descenders. And the opacity floor was
`0.5`, leaving every line competing with the one being read. More air, a 30%
fade, and a floor of `0.16`.

### Trip pages shipped the whole catalogue to the browser

`PriceBar` imported `money()` from `lib/trips.js`, which also holds 1,100 lines
of trip content — all of it went into the client bundle. Formatters moved to
`lib/format.js`. Trip pages: 155 kB → 147 kB First Load JS.

### A dead stylesheet

`globals.css` carried a complete dark-mode admin theme (`#admin`, `.adm-wrap`,
`.btn`, `.tab`, `.adm-card`, `.grid2`, `.f`, `.hint`, `.dayrow`, `.mini`,
`.lock`) that nothing referenced — the panel renders the light `body.adm` set.
37 lines removed.

### Accessibility

- `/packages` had no `h1` at all. Every page has exactly one now.
- `aria-controls` on the price bar's Options toggle, `aria-live` on the traveller
  steppers, `aria-current="step"` on the active day.
- Reduced motion now renders every section. Two earlier attempts at this failed
  in ways worth recording, and the reasoning is in the comments in
  `Journey.jsx`: `initial={false}` alone left everything below the fold at
  opacity 0, and swapping to a plain element was worse, because
  `useReducedMotion` reads false during server render so Motion had already
  written `opacity: 0` inline and React reused the node.
- The selected filter pill and active day tab are painted directly under reduced
  motion, since their backgrounds are Motion elements that would otherwise leave
  dark text on a dark page.
- Sign-in errors stay on screen instead of fading after 1.8 seconds.

---

## Redesigned

### `/packages`

Was sitting inside the 860px `.panel-in` that trip pages use, leaving two thirds
of a desktop window empty, with three cards in a two-column grid and a hole in
it. Rebuilt at full width: a working terrain filter with counts and a sliding
pill, a lead card for the soonest real departure, an auto-filling grid behind it,
and departures grouped by month instead of a dozen hairline rows.

Trips without a page yet now appear here too, as they already did on the home
page, so the catalogue is consistent and the grid has enough cells to sit evenly.

### Admin sign-in

Was a bare centred form using placeholders as labels. Now: the wordmark, labels
above their fields, a real `<form>` so Enter and password managers behave,
`autocomplete` attributes, and errors that persist. The panel itself is
untouched — it should stay plain and fast.

### 404

Was one heading and a Home button on a black page. Lists the real trips now.

### The inner-page footer

Was three lines of text with every trip name run together by middle dots, which
read as an afterthought beside the landing page's colophon. Same three-column
structure as the colophon now, in the page's own terrain palette.

### Type and shape

- Negative tracking on the display face as it scales up; Alfa Slab is heavy
  enough that its counters close in otherwise.
- One documented radius scale, replacing a mix of 2, 3, 4, 5, 8, 10, 14 and 16px:
  `--r-card` for cards and panels, `--r-ctl` for buttons and inputs, full pill
  for metadata chips and filters.
- The amber neon bloom under the main call to action is now a tinted shadow in
  the accent's own hue.
- Terrain sections open with a hairline rather than another uppercase label,
  which keeps the page to two of them.

### Motion

Reveals, card stagger, hover and press physics, the sliding filter pill and the
sliding day marker are all Motion now, with spring transitions rather than
linear easing. Continuous scroll values go through motion values, never state.

---

## Files

**New**

    components/useSeasonBackdrop.js   the scroll blend engine, extracted
    components/useLiveConditions.js   location and weather, cancellable
    components/TripIndex.jsx          the filtered trips index
    lib/cards.js                      one card shape, built server-side
    lib/format.js                     formatters, free of the catalogue

**Changed**

    package.json, package-lock.json
    app/layout.jsx           app/page.jsx
    app/globals.css          app/journey.css
    app/not-found.jsx        app/packages/page.jsx
    app/packages/[slug]/page.jsx
    components/Journey.jsx   components/SiteFooter.jsx
    components/DayTrack.jsx  components/TripPage.jsx
    components/PriceBar.jsx  components/AdminPanel.jsx
    lib/trips.js

---

## Verified

Production build, all 11 routes prerendered. Every route returns its expected
status with exactly one `h1`. Console clean. Reduced motion leaves nothing
hidden. The landing page's loop stops on unmount and releases its video
elements. Checked at 1440x900 and 390x844.

## Still open

- No Instagram handle in your data. Add `instagram` to your site settings and the
  footer link appears.
- Remote images and video could not be reached from the sandbox this was built
  in, so the screenshots show flat panels where your Unsplash and Mixkit assets
  belong. They are untouched and will load for you.
