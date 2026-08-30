"use client";
import { money, fmtDate, fmtLong, upcomingDates, isSeasonDate } from "@/lib/format";
import { trackWhatsApp } from "@/lib/analytics";

/* ============================================================
   EVERY DATE THIS TRIP RUNS

   Read from trip.dates, which comes from the departure_dates table, so
   adding a date in the admin puts it on the page. The dates carrying the
   season surcharge come from the same rows' seasonal flag, and they are
   marked with what they actually add rather than being quietly different
   when someone reaches the price bar.

   Grouped by month, because a trip with forty-six departures is a wall
   of chips otherwise. Each date opens WhatsApp already asking about that
   day, which is how these get booked.
   ============================================================ */
export default function Departures({ trip, whatsapp }) {
  const dates = upcomingDates(trip);
  if (!dates.length) return null;

  const surcharge = Number(trip.seasonRate) || 0;
  const base = (trip.fares || []).reduce(
    (lo, f) => (Number(f.price) > 0 ? Math.min(lo, Number(f.price)) : lo),
    Infinity
  );

  const months = [];
  dates.forEach((d) => {
    const label = new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      month: "long", year: "numeric",
    });
    const last = months[months.length - 1];
    if (last && last.label === label) last.dates.push(d);
    else months.push({ label, dates: [d] });
  });

  const anySeason = surcharge > 0 && dates.some((d) => isSeasonDate(trip, d));

  const link = (d) => {
    const msg =
      `Hi Ghumakkaad - I'd like to book ${trip.name} (${trip.duration}) ` +
      `on ${fmtLong(d)}.` + (isSeasonDate(trip, d) ? " I know this is a season date." : "");
    return whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
      : "/packages";
  };

  return (
    <section className="panel" id="dates">
      <div className="panel-in">
        <h2 className="pre">When it runs</h2>
        <p className="lede pre">
          {dates.length} {dates.length === 1 ? "departure" : "departures"} still open.
          {anySeason ? " Dates marked with a plus cost more, and by how much." : ""}
        </p>

        <div className="dep-months">
          {months.map((m) => (
            <div className="dep-month pre" key={m.label}>
              <h3>{m.label}</h3>
              <ul>
                {m.dates.map((d) => {
                  const season = isSeasonDate(trip, d);
                  return (
                    <li key={d}>
                      <a
                        className={"dep-chip" + (season ? " is-season" : "")}
                        href={link(d)} rel="noopener" target="_blank"
                        onClick={() => trackWhatsApp(trip.name, "departures_list")}
                      >
                        <b>{fmtDate(d)}</b>
                        <span>
                          {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        {season && (
                          <i title={`Season rate: ${money(surcharge)} more per person`}>
                            +{money(surcharge)}
                          </i>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {anySeason && Number.isFinite(base) && (
          <p className="note dep-note">
            A season date is {money(base + surcharge)} per person instead of {money(base)}.
            Everything included on the trip is the same.
          </p>
        )}
      </div>
    </section>
  );
}
