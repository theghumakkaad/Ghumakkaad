"use client";
import { forwardRef, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { responsiveSrcSet } from "@/lib/images";
import { trackWhatsApp } from "@/lib/analytics";

/* ============================================================
   The trips index.

   The whole catalogue is rendered on the server and filtered here,
   so switching terrain is instant and the cards move rather than
   the page reloading. The choice is written back to the query
   string, which is what makes the footer's /packages?terrain=snow
   links work: before this they pointed at a parameter nothing read.
   ============================================================ */

const EASE = [0.16, 1, 0.3, 1];

const FILTERS = [
  { key: "all",     label: "Everything" },
  { key: "snow",    label: "Snow" },
  { key: "monsoon", label: "Monsoon" },
  { key: "desert",  label: "Desert" },
  { key: "beach",   label: "Beach" },
];

/* AnimatePresence in popLayout mode measures each exiting child, so
   the ref has to reach the motion element rather than stop here. */
const TripCard = forwardRef(function TripCard({ card, waLink, wide = false }, ref) {
  const reduce = useReducedMotion();
  const draft = !card.slug;
  const href = draft
    ? waLink(`Hi Ghumakkaad, tell me when the ${card.name} trip opens.`)
    : `/packages/${card.slug}`;

  const inner = (
    <>
      {/* plain img rather than next/image: the optimiser fetches remote
          files server-side and both hosts these photographs live on
          answer that with a 403, so the cards came up empty. The sources
          are 900px wide, so there was nothing to resize down from. */}
      <span className="tc-wash" data-terrain={card.terrain} aria-hidden="true" />
      {card.cardImage || card.fallbackImage ? (
        <img
          className="tc-img" src={card.cardImage || card.fallbackImage}
          srcSet={responsiveSrcSet(card.cardImage || card.fallbackImage)}
          sizes={wide ? "(min-width: 900px) 66vw, 100vw" : "(min-width: 640px) 320px, 90vw"}
          alt={`${card.name} — ${card.terrain} trip`}
          decoding="async" loading={wide ? "eager" : "lazy"}
          /* same chain as the hero: the trip's own photograph, then one of
             the right season, then out of the way so the wash carries the
             card. The two trips on Wikimedia were coming up bare here too. */
          onError={(e) => {
            const el = e.currentTarget;
            if (card.fallbackImage && el.src !== card.fallbackImage) el.src = card.fallbackImage;
            else el.style.display = "none";
          }}
        />
      ) : null}
      <span className="tc-body">
        <span className="tc-meta">
          {card.days}
          {card.nextLabel ? <>&nbsp;&nbsp;·&nbsp;&nbsp;next {card.nextLabel}</> : null}
        </span>
        <span className="tc-name">{card.name}</span>
        {wide && <span className="tc-blurb">{card.blurb}</span>}
        <span className="tc-foot">
          <span className="tc-price">
            {card.priceLabel ? <>From {card.priceLabel} pp</> : "Opening soon"}
          </span>
          {/* the lead card is big enough to say what the button does;
              the small cards are a single tap target, so an arrow reads
              cleaner than a label repeated six times down the page */}
          {wide ? (
            <span className="tc-cta">
              {draft ? "Notify me" : "Itinerary"}
              {draft ? <WhatsappLogo size={14} weight="bold" aria-hidden="true" />
                     : <ArrowRight size={14} weight="bold" aria-hidden="true" />}
            </span>
          ) : (
            <span className="tc-go">
              {draft ? <WhatsappLogo size={14} weight="bold" aria-hidden="true" />
                     : <ArrowRight size={13} weight="bold" aria-hidden="true" />}
            </span>
          )}
        </span>
      </span>
    </>
  );

  /* same rule as the landing page: the element type never changes with
     the motion preference, only the animation props */
  const props = {
    ref,
    className: "trip-card" + (wide ? " trip-card--wide" : "") + (draft ? " trip-card--draft" : ""),
    layout: !reduce,
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: reduce ? undefined : { opacity: 0, y: -10 },
    transition: reduce ? { duration: 0 } : { duration: 0.45, ease: EASE },
  };

  return draft ? (
    <motion.a {...props} href={href} rel="noopener" target="_blank"
      onClick={() => trackWhatsApp(card.name, "trip_index_draft")}>{inner}</motion.a>
  ) : (
    <motion.div {...props}>
      <Link href={href} className="tc-hit">{inner}</Link>
    </motion.div>
  );
});

/* initialTerrain comes from the server component's own searchParams prop
   rather than useSearchParams() here. That hook reads the query string at
   render time, which is exactly what forced the whole grid behind a
   Suspense boundary that only resolved client-side after hydration — a
   crawler or link-preview bot that does not run JS saw "Pick your
   weather." and nothing else, no cards, no trip names, no prices. Taking
   the value as a prop keeps the terrain filter working (the click handler
   below still updates the URL) while letting the full catalogue render in
   the actual HTML response. */
export default function TripIndex({ cards = [], whatsapp, initialTerrain = null }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(
    FILTERS.some((f) => f.key === initialTerrain) ? initialTerrain : "all"
  );

  const waLink = (msg) =>
    whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}` : "/packages";

  const counts = useMemo(() => {
    const c = { all: cards.length };
    cards.forEach((card) => { c[card.terrain] = (c[card.terrain] || 0) + 1; });
    return c;
  }, [cards]);

  const shown = active === "all" ? cards : cards.filter((c) => c.terrain === active);

  /* the soonest real departure leads the page, but only when there is
     enough behind it for a lead card to make sense */
  const feature = shown.length >= 4 ? shown.find((c) => c.slug && c.nextDate) : null;
  const rest = feature ? shown.filter((c) => c !== feature) : shown;

  function choose(key) {
    setActive(key);
    router.replace(key === "all" ? "/packages" : `/packages?terrain=${key}`, { scroll: false });
  }

  return (
    <>
      <div className="index-head">
        <h1>Pick your weather.</h1>
        <p className="lede">
          Every departure we run out of Gujarat, with the fare per person and the next
          date on each card.
        </p>
      </div>

      <div className="filters" role="group" aria-label="Filter trips by terrain">
        {FILTERS.filter((f) => counts[f.key]).map((f) => (
          <button
            key={f.key} type="button" className="filter"
            aria-pressed={active === f.key} onClick={() => choose(f.key)}
          >
            {f.label}
            <span className="filter-n">{counts[f.key]}</span>
            {active === f.key && !reduce && (
              <motion.span className="filter-ink" layoutId="filter-ink"
                transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
          </button>
        ))}
      </div>

      {feature && (
        <div className="feature-row">
          <TripCard key={feature.key} card={feature} waLink={waLink} wide />
        </div>
      )}

      <motion.div className="trip-grid" layout={!reduce}>
        <AnimatePresence mode="popLayout">
          {rest.map((card) => (
            <TripCard key={card.key} card={card} waLink={waLink} />
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="empty-note">
          Nothing on this terrain right now. <button type="button" className="linkish"
            onClick={() => choose("all")}>Show every trip</button> instead.
        </p>
      )}
    </>
  );
}
