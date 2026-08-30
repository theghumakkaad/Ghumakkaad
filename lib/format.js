/* ============================================================
   Pure formatting and date helpers.

   These live apart from lib/trips.js on purpose. That file also
   holds the whole bundled catalogue, and importing a single helper
   from it dragged all 1,100 lines of trip content into the browser
   bundle for anyone who loaded a trip page. Nothing here closes
   over the catalogue, so it costs a few hundred bytes.
   ============================================================ */

export const money = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN");

export const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const fmtLong = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

/* Math.min() of an empty list is Infinity, which rendered as "₹∞" on
   any trip whose fares had not been filled in yet. Null means "no
   price to show", and every caller checks for it. */
export const fromPrice = (t) => {
  const prices = (t.fares || [])
    .map((f) => Number(f.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};

/* Only dates that have not left yet. This used to fall back to the
   full list when nothing was upcoming, which meant the home page
   advertised departures that had already gone. An empty list is the
   honest answer, and every caller handles it. */
export const upcomingDates = (t) => {
  const today = new Date().setHours(0, 0, 0, 0);
  return (t.dates || [])
    .filter((d) => new Date(d + "T00:00:00").getTime() >= today)
    .sort();
};

export const isSeasonDate = (t, d) => {
  if (!d || !t.seasonRate) return false;
  if ((t.seasonalDates || []).includes(d)) return true;
  return (t.seasonWindows || []).some((w) => d >= w[0] && d <= w[1]);
};
