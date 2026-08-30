import { comingSoon } from "./trips";
import { fromPrice, upcomingDates, money, fmtDate } from "./format";

/* ============================================================
   One shape for a trip card, built on the server.

   Live trips come from getTrips(), which reads Supabase and only falls
   back to the bundled file if the database is unreachable. Alongside
   them, comingSoon carries the places that are opening but have no page
   yet, so every season the brand actually runs has something in it.

   The two are kept apart where it matters: the hero's departure list is
   live trips only, because a departure date has to be a real one you can
   book. The terrain sections show both, with the openers marked.

   The landing page and /packages both need the same handful of
   facts about a trip: its code, duration, next real departure and
   starting fare. Deriving them here keeps the date arithmetic on
   the server, which matters twice over: lib/trips.js is 1,100
   lines that have no business in the browser bundle, and any
   new Date() run in both places is a hydration mismatch waiting
   to happen.
   ============================================================ */

export const TERRAINS = [
  { key: "snow",    label: "Snow and Himalaya" },
  { key: "monsoon", label: "Monsoon hills" },
  { key: "desert",  label: "Desert and dunes" },
  { key: "beach",   label: "Beach" },
];

/* ------------------------------------------------------------------
   A photograph of the right season for a trip whose own photograph
   will not load.

   Jodhpur & Jaisalmer and Shimla Manali Kasol are the only two trips whose
   cardImage is hosted on upload.wikimedia.org, and they are exactly the two
   whose hero came up with no picture. Every image that does arrive on the
   site is on images.unsplash.com. So a trip's own photograph is tried
   first, and if it does not arrive the reader gets the right terrain rather
   than an empty frame.

   Three of these four are already on the page — they are the stills the
   backdrop engine uses for the snow, monsoon and beach scenes — so they are
   known to load here. The desert one is new; it is tagged both Jaisalmer
   and Thar desert on Unsplash.

   This is a safety net, not the intent. A real photograph of the real trip,
   set in the admin, beats a stock one of the right sand every time.
   ------------------------------------------------------------------ */
const UNSPLASH = (id) => `https://images.unsplash.com/${id}?w=1800&q=72&auto=format&fit=crop`;

export const TERRAIN_STILL = {
  snow:    UNSPLASH("photo-1542986949-cd1d830d0f86"),
  monsoon: UNSPLASH("photo-1470071459604-3b5ec3a7fe05"),
  desert:  UNSPLASH("photo-1616693139578-f1c17deb0d4f"),
  beach:   UNSPLASH("photo-1512343879784-a960bf40e7f2"),
};

/* SAP-03, JOD-03: three letters of the name and the day count */
function ticketCode(name, duration) {
  const letters = (name || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const days = (duration || "").match(/(\d+)\s*D/i);
  return days ? `${letters}-${days[1].padStart(2, "0")}` : letters;
}

export function buildCards(trips = []) {
  const routed = trips.map((t) => {
    const next = upcomingDates(t)[0] || null;
    const price = fromPrice(t);
    return {
      key: `trip-${t.slug}`,
      terrain: t.terrain,
      slug: t.slug,
      name: t.name,
      days: t.duration,
      blurb: t.sub,
      cardImage: t.cardImage || "",
      /* the season's own photograph, if the trip's will not load */
      fallbackImage: TERRAIN_STILL[t.terrain] || "",
      priceFrom: price,
      priceLabel: price == null ? null : money(price),
      nextDate: next,
      nextLabel: next ? fmtDate(next) : null,
      dates: upcomingDates(t),
      code: ticketCode(t.name, t.duration),
    };
  });

  /* places we run or are opening that do not have a page yet. They link
     to WhatsApp rather than a route that does not exist. */
  const soon = comingSoon.map((e, i) => ({
    key: `soon-${e.terrain}-${i}`,
    terrain: e.terrain,
    slug: null,
    name: e.name,
    days: e.days,
    blurb: e.blurb,
    cardImage: e.cardImage || "",
    fallbackImage: TERRAIN_STILL[e.terrain] || "",
    priceFrom: e.priceFrom ?? null,
    priceLabel: e.priceFrom == null ? null : money(e.priceFrom),
    nextDate: null,
    nextLabel: null,
    dates: [],
    code: ticketCode(e.name, e.days),
  }));

  return [...routed, ...soon];
}

/* The landing page's departure board.

   Every trip that has an upcoming date is represented, soonest first, so
   adding a package in the admin puts it on the board without anyone
   touching this file. Remaining slots are then filled chronologically,
   capped per trip, so one weekly departure cannot take the whole board
   while a monthly one waits behind it.

   It used to be strictly one row per trip. With three trips and one of
   them carrying no dates at all, that meant the board only ever had two
   rows on it. */
export function buildBoard(cards, limit = 5, perTrip = 2) {
  const live = cards.filter((c) => c.slug && c.dates?.length);
  const taken = new Map();
  const rows = [];

  const push = (card, date) => {
    rows.push({
      key: `${card.slug}-${date}`,
      href: `/packages/${card.slug}`,
      name: card.name,
      days: card.days,
      dateLabel: fmtDate(date),
      date,
    });
    taken.set(card.slug, (taken.get(card.slug) || 0) + 1);
  };

  /* one for each trip first, so nothing new is ever invisible */
  live
    .slice()
    .sort((a, b) => (a.dates[0] < b.dates[0] ? -1 : 1))
    .forEach((c) => { if (rows.length < limit) push(c, c.dates[0]); });

  /* then fill up, soonest first, respecting the per-trip cap */
  const rest = live
    .flatMap((c) => c.dates.slice(1).map((d) => ({ card: c, date: d })))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const { card, date } of rest) {
    if (rows.length >= limit) break;
    if ((taken.get(card.slug) || 0) >= perTrip) continue;
    push(card, date);
  }

  return rows.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/* Every upcoming departure, chronologically, for the trips index. */
export function buildDepartures(trips = [], limit = 12) {
  return trips
    .flatMap((t) =>
      upcomingDates(t)
        .slice(0, 4)
        .map((d) => ({
          key: `${t.slug}-${d}`,
          date: d,
          dateLabel: fmtDate(d),
          month: new Date(d + "T00:00:00").toLocaleDateString("en-IN", { month: "long" }),
          name: t.name,
          days: t.duration,
          href: `/packages/${t.slug}`,
        }))
    )
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, limit);
}

/* The hero walks through the trips you can actually book: one slide per
   live package, using that package's own photograph and its own next
   date. Openers are not in here, because "next departure" has to mean a
   date somebody can hold a seat on. */
export function buildHeroSlides(cards) {
  return cards.filter((c) => c.slug).map((c) => ({
    key: c.key,
    href: `/packages/${c.slug}`,
    name: c.name,
    days: c.days,
    terrain: c.terrain,
    image: c.cardImage || null,
    fallback: c.fallbackImage || null,
    nextLabel: c.nextLabel,
    priceLabel: c.priceLabel ? `from ${c.priceLabel}` : null,
  }));
}
