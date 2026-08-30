"use client";
import { useEffect, useMemo, useState } from "react";
import { money, fmtDate, fmtLong, upcomingDates, isSeasonDate } from "@/lib/format";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { trackWhatsApp } from "@/lib/analytics";

/* ============================================================
   The price bar adapts to whatever fare model a trip has:
   boarding cities, room sharing, or train classes — with child
   rates, add-ons, GST and a season surcharge where they apply.
   ============================================================ */
export default function PriceBar({ trip, whatsapp }) {
  const dates = useMemo(() => upcomingDates(trip), [trip]);
  const [fareId, setFareId] = useState(trip.fares?.[0]?.id);
  const [addonId, setAddonId] = useState(trip.addons?.[0]?.id ?? null);
  const [date, setDate] = useState(null);
  const [pax, setPax] = useState(1);
  const [kids, setKids] = useState(0);
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);

  useEffect(() => {
    const onScroll = () => setUp(scrollY > innerHeight * 0.6);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  /* the number comes from the database via props now; it used to be
     read from the bundled copy of lib/trips.js, so changing it in the
     admin left every Book button pointing at the old one */
  const waLink = (msg) =>
    whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}` : "/packages";

  const fares = trip.fares?.length ? trip.fares : [{ id: "f0", label: "Per person", price: 0 }];
  const fare = fares.find((f) => f.id === fareId) || fares[0];
  const addon = (trip.addons || []).find((a) => a.id === addonId) || { add: 0, label: "" };
  const season = isSeasonDate(trip, date) ? trip.seasonRate : 0;
  const heads = pax + kids;
  const perAdult = fare.price + (addon.add || 0);
  const adultCost = perAdult * pax;
  const kidCost = kids * ((fare.child ?? fare.price) + (addon.add || 0));
  const seasonCost = season * heads;
  const sub = adultCost + kidCost + seasonCost;
  const gst = trip.gstPercent ? Math.round((sub * trip.gstPercent) / 100) : 0;
  const total = sub + gst;

  const message =
    `Hi Ghumakkaad - I'd like to book ${trip.name} (${trip.duration}).\n` +
    `${trip.fareLabel || "Option"}: ${fare.label}\n` +
    (addon.label ? `${addon.label}\n` : "") +
    `Date: ${date ? fmtLong(date) + (season ? " (season rate)" : "") : "please send me the next departures"}\n` +
    `Adults: ${pax}` + (kids ? `\nChildren 5-10: ${kids}` : "") + "\n" +
    `Quoted total: ${money(total)}`;

  return (
    <div className={"pricebar" + (up ? " up" : "")}>
      <div className={"pb-panel" + (open ? " open" : "")} id="pb-options">
        <div className="pb-inner">
          <div className="field">
            <label>{trip.fareLabel || "Option"}</label>
            <div className="chips">
              {fares.map((f) => (
                <button key={f.id} type="button" className="chip"
                  aria-pressed={f.id === fare.id} onClick={() => setFareId(f.id)}>
                  {f.label}{f.note ? <small>{f.note}</small> : null}
                </button>
              ))}
            </div>
          </div>

          {dates.length > 0 && (
            <div className="field">
              <label>Departure date</label>
              <div className="dates">
                {dates.map((d) => (
                  <button key={d} type="button" className="chip"
                    aria-pressed={d === date}
                    onClick={() => setDate(d === date ? null : d)}>
                    {fmtDate(d)}
                    <small>{new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}</small>
                    {isSeasonDate(trip, d) && <b>+{(trip.seasonRate / 1000)}k</b>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(trip.addons || []).length > 0 && (
            <div className="field">
              <label>{trip.addonLabel || "Options"}</label>
              <div className="chips">
                {trip.addons.map((a) => (
                  <button key={a.id} type="button" className="chip"
                    aria-pressed={a.id === addon.id} onClick={() => setAddonId(a.id)}>
                    {a.label}{a.note ? <small>{a.note}</small> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label>Travellers</label>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <span className="steplab">Adults</span>
                <div className="stepper">
                  <button type="button" onClick={() => setPax((n) => Math.max(1, n - 1))} aria-label="One fewer adult">−</button>
                  <output aria-live="polite">{pax}</output>
                  <button type="button" onClick={() => setPax((n) => Math.min(30, n + 1))} aria-label="One more adult">+</button>
                </div>
              </div>
              {trip.childRates && (
                <div>
                  <span className="steplab">Children 5–10</span>
                  <div className="stepper">
                    <button type="button" onClick={() => setKids((n) => Math.max(0, n - 1))} aria-label="One fewer child">−</button>
                    <output aria-live="polite">{kids}</output>
                    <button type="button" onClick={() => setKids((n) => Math.min(15, n + 1))} aria-label="One more child">+</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="breakdown">
            <div><span>{fare.label}{pax > 1 ? ` × ${pax}` : ""}</span><span>{money(adultCost)}</span></div>
            {kids > 0 && <div><span>Child 5–10 × {kids}</span><span>{money(kidCost)}</span></div>}
            {season > 0 && <div><span>Season rate × {heads}</span><span>+ {money(seasonCost)}</span></div>}
            {gst > 0 && <div><span>GST {trip.gstPercent}%</span><span>+ {money(gst)}</span></div>}
            <div className="total"><span>Total</span><span>{money(total)}</span></div>
          </div>
          <p className="note">
            {trip.gstPercent
              ? "GST is added above, so this is the amount you pay."
              : "We confirm everything on WhatsApp before you pay."}
          </p>
        </div>
      </div>

      <div className="pb-main">
        <div className="pb-price">
          <b>{money(total)}</b>
          <span>
            {heads > 1 ? `${heads} travellers` : "per person"} · {fare.label}
            {dates.length ? (date ? ` · ${fmtDate(date)}${season ? " · season" : ""}` : " · pick your date") : ""}
          </span>
        </div>
        <button className="pb-open" onClick={() => setOpen((o) => !o)}
          aria-expanded={open} aria-controls="pb-options">
          {open ? "Close" : "Options"}
        </button>
        <a className="pb-cta" href={waLink(message)} rel="noopener" target="_blank"
          onClick={() => trackWhatsApp(trip.name, "price_bar")}>
          <WhatsappLogo size={16} weight="bold" />
          {/* same two corrections as the landing page's CTA: the mark is bold
              rather than fill so it reads as the WhatsApp logo instead of a
              dark disc, and the label's trailing letter-spacing is cancelled
              so the content sits centred in the button */}
          <span className="pb-label">Book</span>
        </a>
      </div>
    </div>
  );
}
