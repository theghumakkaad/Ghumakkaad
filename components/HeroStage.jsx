"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { responsiveSrcSet } from "@/lib/images";

/* ============================================================
   THE HERO

   Built entirely from what is live in the database. Every slide is a
   trip that exists, using the photograph already on that trip's own
   record and its own next departure date, so a package added in the
   admin appears here with nothing to change in this file, and one
   taken down disappears.

   It moves for a reason. A reader arriving has not decided where they
   want to go, so the hero shows them: it walks through the real trips,
   and hovering or focusing a departure holds it on that one. The
   photographs are the trips' own rather than stock, which is most of
   the difference between this reading as a travel company and reading
   as a template.

   The photography and the departure list sit in different places in
   the tree, one on a fixed layer behind the page and one inside the
   copy, so the rotation lives in a hook they both take.

   Two deliberate choices about the images.

   They are plain <img>, not next/image. next/image fetches every remote
   file through the server first, and both hosts your photographs live on
   answer that fetch with a 403, which is why the top of the page was
   coming up empty. A plain tag is requested by the browser directly and
   just works. There is nothing to lose either: your sources are 900px
   wide, so there is no larger original for the optimiser to resize down
   from anyway.

   And there is a generated plate behind them. If a photograph is slow,
   blocked, or missing from a package, the reader sees the night road
   rather than a hole. The background cannot be absent.

   How much of this layer shows is set by the backdrop engine through
   --hero-on, not by anything in here. See the note in Journey.jsx.
   ============================================================ */

const HOLD_MS = 5200;

export function useHeroRotation(count) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const timer = useRef(0);

  const advance = useCallback(() => setActive((i) => (i + 1) % count), [count]);

  useEffect(() => {
    /* nothing to rotate, or the reader has asked for less movement, or
       they are holding one open */
    if (reduce || held || count < 2) return;
    timer.current = setInterval(advance, HOLD_MS);
    return () => clearInterval(timer.current);
  }, [reduce, held, count, advance]);

  /* a package removed in the admin must not leave this pointing past
     the end of the list */
  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  return { active, held, reduce, hold: setActive, release: setHeld };
}

/* Which photographs are actually usable.

   A trip whose cardImage 404s, or has not decoded yet, must not be allowed
   to put an empty panel on screen: that is what "the background goes blank
   on hover" was. So each image reports back, and the layer as a whole steps
   aside whenever the trip on screen has nothing to show, letting the video
   playing behind it be the background instead.

   naturalWidth is checked as well as the load event because an image can
   fire load and still have decoded to nothing. */
function useShotSources(slides) {
  /* per slide: 0 = the trip's own photograph, 1 = the season's, 2 = neither */
  const [step, setStep] = useState({});
  const next = useCallback((key) => {
    setStep((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
  }, []);
  /* a slide list that changes in the admin must not keep old verdicts */
  useEffect(() => {
    setStep((prev) => {
      const live = {};
      slides.forEach((s) => { if (s.key in prev) live[s.key] = prev[s.key]; });
      return live;
    });
  }, [slides]);

  const chain = (s) => [s.image, s.fallback].filter(Boolean);
  const srcFor = (s) => chain(s)[step[s.key] ?? 0] || null;
  return { srcFor, next };
}

export function HeroMedia({ slides, active, reduce }) {
  const { srcFor, next } = useShotSources(slides);
  const current = slides[active];
  /* nothing left to try for this trip: stand the whole layer down so the
     footage behind it becomes the background, rather than leaving an empty
     panel on screen */
  const empty = !current || !srcFor(current);

  return (
    <div className={"hero-media" + (empty ? " is-empty" : "")} aria-hidden="true">
      {slides.map((s, i) => {
        const src = srcFor(s);
        return (
          <div key={s.key} className={"hero-shot" + (i === active ? " is-on" : "")}>
            {src ? (
              <img
                key={src} src={src}
                srcSet={responsiveSrcSet(src)}
                sizes="100vw"
                alt=""
                decoding="async"
                fetchPriority={i === 0 ? "high" : "low"}
                /* all of them eager: there are only a handful, and a lazy one
                   had not loaded by the time the reader hovered its row */
                loading="eager"
                className={reduce ? undefined : "hero-shot-img"}
                /* down the chain on failure: the trip's own photograph, then
                   a photograph of the right season, then nothing */
                onError={() => next(s.key)}
                onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) next(s.key); }}
                ref={(el) => {
                  /* a cached image can finish before React attaches the
                     handlers, so a broken one is caught here too */
                  if (el && el.complete && el.naturalWidth === 0) next(s.key);
                }}
              />
            ) : null}
          </div>
        );
      })}
      <span className="hero-media-scrim" />
    </div>
  );
}

export function HeroDepartures({ slides, active, held, reduce, hold, release }) {
  if (!slides.length) return null;
  return (
    <div className="hero-list">
      <p className="hero-list-label">
        Next departures
        <span>{slides.length} {slides.length === 1 ? "trip" : "trips"} running</span>
      </p>

      <ul>
        {slides.map((s, i) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={"hero-row" + (i === active ? " is-on" : "")}
              onMouseEnter={() => { hold(i); release(true); }}
              onMouseLeave={() => release(false)}
              onFocus={() => { hold(i); release(true); }}
              onBlur={() => release(false)}
            >
              {/* the date column is narrow, so a trip with no departures
                  loaded yet says so in two words rather than overflowing
                  across the name beside it */}
              <span className="hero-row-date">
                {s.nextLabel || <em>On request</em>}
              </span>
              <span className="hero-row-name">{s.name}</span>
              <span className="hero-row-meta">
                <i>{s.days}</i>
                {s.priceLabel ? <b>{s.priceLabel}</b> : null}
              </span>
              <ArrowUpRight className="hero-row-go" size={14} weight="bold" aria-hidden="true" />

              {/* Marks which trip is on screen, and how long it has left.

                  No layoutId here. It had one, to slide the bar between
                  rows, and Motion's layout projection cannot compose with
                  an ancestor that is being transformed: the hero copy
                  carries a scroll-driven transform, so the bar was
                  projected into empty space and left an amber line
                  drifting down the middle of the page. */}
              {i === active && (
                <span className="hero-row-bar">
                  {reduce ? null : (
                    <motion.i
                      key={`${s.key}-${held}`}
                      initial={{ scaleX: held ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={held ? { duration: 0.25 }
                        : { duration: HOLD_MS / 1000, ease: "linear" }}
                    />
                  )}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
