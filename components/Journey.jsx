"use client";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, ArrowUp, EnvelopeSimple, InstagramLogo, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { HeroDepartures, HeroMedia, useHeroRotation } from "./HeroStage";
import { useSeasonBackdrop } from "./useSeasonBackdrop";
import { useLiveConditions } from "./useLiveConditions";
import { trackWhatsApp, trackCall, trackEmail } from "@/lib/analytics";
import "@/app/journey.css";

/* ============================================================
   The landing page: one road, four seasons.

   Cards and departures are rendered by React from props the server
   prepared, so an admin edit shows up here without this component
   knowing anything about the database. It used to write them with
   innerHTML from a window global, which meant any text typed into
   the admin was injected as markup.

   The scroll choreography lives in useSeasonBackdrop and paints
   through the refs below, because it runs at frame rate.
   ============================================================ */

const EASE = [0.16, 1, 0.3, 1];
const MotionLink = motion.create(Link);

const TERRAINS = [
  {
    key: "snow", scene: "snow", height: "280vh",
    title: ["Where the road", "turns white."],
    lede: "700 metres to 3,978 at Rohtang. Two routes go up: eight days, or eleven.",
  },
  {
    key: "monsoon", scene: "rain", height: "280vh",
    title: ["Then it starts", "raining."],
    lede: "Saputara and Matheran, June to September. Waterfalls that are not there in April.",
  },
  {
    key: "desert", scene: "sand", height: "280vh",
    title: ["Sand gets", "everywhere."],
    lede: "Sam dunes, Swiss tents, and Kuldhara, a village left empty in 1825 and never lived in since.",
  },
  {
    key: "beach", scene: "sea", height: "260vh",
    title: ["Where the road", "ends."],
    lede: "Goa. Elevation zero, and nothing left to drive to.",
  },
];

const MANIFESTO = [
  ["Nobody remembers the ", "hotel", "."],
  ["They remember the ", "4 a.m. chai stop", "."],
  ["The stranger who ends up taking ", "every photo", "."],
  ["The bus pulling over because ", "the view was worth it", "."],
];

/* ---------- the hero ---------- */

/* Each word rides up out of its own clipped box, so the headline
   assembles rather than fading in as a block. Two lines, and the amber
   one lands last because it is the payoff. The mask is a real
   overflow:hidden wrapper per word rather than a background-clip trick,
   which keeps the descenders on "y" intact. */
const HEADLINE = [
  { words: ["One", "road,"], accent: false },
  { words: ["four", "seasons."], accent: true },
];

const WORD_IN = {
  hidden: { y: "108%", rotate: 2.5 },
  shown: {
    y: "0%", rotate: 0,
    transition: { type: "spring", stiffness: 190, damping: 24, mass: 0.9 },
  },
};

function Headline({ reduce }) {
  if (reduce) {
    return (
      <h1 className="display hero-title">
        One road,<em>four seasons.</em>
      </h1>
    );
  }
  return (
    <motion.h1
      className="display hero-title"
      initial="hidden"
      animate="shown"
      transition={{ staggerChildren: 0.085, delayChildren: 0.08 }}
    >
      {HEADLINE.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className={"hero-line" + (line.accent ? " hero-line--accent" : "")}>
            {line.words.map((word, w) => (
              <Fragment key={word}>
                {/* a real space, not a margin. Wrapping each word in its own
                    box with the gap faked by margin-left meant the heading's
                    text content was "Oneroad,fourseasons." to a screen
                    reader and to a crawler. */}
                {w > 0 ? " " : null}
                <span className="hero-mask">
                  <motion.span className="hero-word" variants={WORD_IN}>{word}</motion.span>
                </span>
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </motion.h1>
  );
}

/* ---------- small motion pieces ---------- */

/* Reduced motion swaps the animation props, never the element type.
   Two earlier attempts at this were wrong in instructive ways. Passing
   initial={false} on its own left anything below the fold at opacity 0,
   because with only a whileInView target and no animate there was
   nothing to fall back to. Rendering a plain element instead was worse:
   useReducedMotion reads false during server render, so Motion had
   already written opacity:0 inline, and React reused the same node
   rather than replacing it, leaving the inline style behind.

   initial={false} plus an explicit animate target renders straight at
   that target, which is exactly what "no animation" should mean. */
const revealProps = (reduce, delay) =>
  reduce
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.8, delay, ease: EASE },
      };

function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const El = motion[as] || motion.div;
  return (
    <El className={className} {...revealProps(reduce, delay)}>{children}</El>
  );
}

/* The quote reads itself out letter by letter as you travel through the
   section, and it is REVERSIBLE: scroll back and the letters go out again
   in the order they came on. The scroll position is the only clock.

   Four earlier versions were wrong. Two were in-view toggles, so a line
   snapped on and a timed CSS transition then played on its own clock. The
   third read each line's position on screen, which cannot work here: the
   stage is position:sticky, so while the section is pinned the lines do
   not move and their rects are frozen for the whole 340vh. The fourth got
   the driver right but lit and dimmed whole lines.

   The fifth latched each line's progress at its highest value so that
   scrolling back would not un-write what you had read. That is the one that
   stopped it returning to its default position, and it is gone: the value is
   read straight from the scroll now, so the gesture runs both ways and the
   section always looks the same at the same scroll position.

   What moves is the section, so progress through it is the reader's position
   in the quote. Each line owns a slice of that progress, and within its
   slice the letters come up left to right.

   Opacity rather than colour: the highlighted words are var(--acc-1),
   which the backdrop engine is moving from amber through to desert
   orange as you travel, and interpolating colour here would fight it. */
function useManifestoLight(section, lineCount) {
  const lines = useRef([]);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rows = () => lines.current.filter(Boolean);

    if (reduced) {
      rows().forEach((row) => {
        row.querySelectorAll(".mc").forEach((ch) => {
          ch.style.opacity = "1";
          ch.style.transform = "none";
        });
      });
      return;
    }

    /* the characters of each line, in reading order, measured once */
    const glyphs = rows().map((row) => [...row.querySelectorAll(".mc")]);

    const paint = () => {
      const sec = section.current;
      if (!sec) return;
      const travel = sec.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / travel));

      /* leave a little room at each end so the first line is not already
         written on arrival and the last is not rushed on the way out */
      const span = 0.78 / lineCount;
      glyphs.forEach((chars, i) => {
        /* straight from the scroll, not latched, so scrolling up runs the
           sweep backwards */
        const local = Math.min(1, Math.max(0, (p - (0.11 + i * span)) / (span * 0.82)));
        const reach = local * (chars.length + 5);
        chars.forEach((ch, j) => {
          /* a soft edge about three characters wide, so it reads as a
             sweep rather than a row of switches */
          const v = Math.min(1, Math.max(0, (reach - j) / 3));
          /* Each letter arrives as well as lights. The floor has been 0.12
             and then 0.22, both chosen against a near-black test background
             where a faint white letter still reads. It is 0.38 now, and the
             stylesheet's .mc floor matches so the first paint agrees with
             the first frame of this loop. */
          ch.style.opacity = (0.38 + v * 0.62).toFixed(3);
          ch.style.transform = `translateY(${((1 - v) * 0.24).toFixed(3)}em)`;
        });
      });
    };

    paint();
    addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    return () => {
      removeEventListener("scroll", paint);
      removeEventListener("resize", paint);
    };
  }, [section, lineCount]);

  return lines;
}

/* Split into words, then characters inside each word. Words stay
   unbreakable inline-blocks with real spaces between them, so the lines
   still wrap on a phone, and the whole sentence is also rendered once
   for screen readers rather than being spelled out a letter at a time. */
function ManifestoLine({ parts, innerRef }) {
  const [before, highlight, after] = parts;
  const words = [
    ...before.split(/(\s+)/).filter((t) => t.trim()).map((t) => ({ t, hi: false })),
    ...highlight.split(/(\s+)/).filter((t) => t.trim()).map((t) => ({ t, hi: true })),
  ];
  /* the trailing full stop belongs to the last highlighted word */
  if (after) words[words.length - 1] = { ...words[words.length - 1], tail: after };

  return (
    <p ref={innerRef}>
      <span className="sr-only">{before + highlight + after}</span>
      <span aria-hidden="true">
        {words.map((w, k) => (
          <Fragment key={k}>
            {k > 0 ? " " : null}
            <span className={"mw" + (w.hi ? " hi" : "")}>
              {[...(w.t + (w.tail || ""))].map((c, j) => (
                <span className="mc" key={j}>{c}</span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  );
}

function Docket({ card, waLink, index }) {
  const reduce = useReducedMotion();
  const draft = !card.slug || card.priceFrom == null;

  const className = "docket" + (draft ? " docket--draft" : "");
  const shared = {
    className,
    ...(reduce
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.7, delay: index * 0.09, ease: EASE },
          whileHover: { y: -4 },
          whileTap: { scale: 0.99 },
        }),
  };

  const body = (
    <>
      <span className="docket-top">
        <span className="docket-code">{card.code}</span>
        {card.days && <span className="docket-days">{card.days}</span>}
      </span>
      <h3>{card.name}</h3>
      <p>{card.blurb}</p>
      {card.nextLabel && <p className="docket-next">Next departure {card.nextLabel}</p>}
      <span className="docket-foot">
        <span className="price">
          {draft ? (
            <b>Opening soon</b>
          ) : (
            <>
              <small>Starting from</small>
              <b>{card.priceLabel}</b> <i>pp</i>
            </>
          )}
        </span>
        <span className="docket-go">
          {draft ? "Notify me" : "Itinerary"}
          <ArrowRight size={11} weight="bold" aria-hidden="true" />
        </span>
      </span>
    </>
  );

  const href = draft
    ? waLink(`Hi Ghumakkaad, tell me when the ${card.name} trip opens.`)
    : `/packages/${card.slug}`;

  /* a trip with a page gets a real Link so Next prefetches it; one
     without a page yet opens WhatsApp instead of a dead route */
  return draft ? (
    <motion.a {...shared} href={href} rel="noopener" target="_blank"
      onClick={() => trackWhatsApp(card.name, "docket_draft")}>{body}</motion.a>
  ) : (
    <MotionLink {...shared} href={href}>{body}</MotionLink>
  );
}

/* ---------- opening ---------- */

/* A one-time entrance so the logo gets a moment large enough to actually
   read. The header copy of it is deliberately small — that is the fixed
   nav, and it has to stay out of the way on a phone — so this is the one
   place the badge itself, the hiker, the mountain, the full name, is
   legible. It plays once per tab: a flag in sessionStorage means it does
   not replay on a second visit today or on a client-side navigation back
   to "/". Reduced motion skips it outright rather than holding the page
   hostage to an animation nobody asked to see.

   The reduced-motion check reads matchMedia directly inside the effect
   rather than trusting useReducedMotion()'s return value at this point:
   that hook reads false during server render, same gotcha as Headline
   above, and this component only ever runs the check once on mount. */
const INTRO_KEY = "ghumakkaad-intro-seen";

function IntroSplash() {
  /* Starts visible. Neither the server nor React's very first pass on the
     client can read sessionStorage or a motion preference, so if this
     defaulted to hidden-until-proven-wanted, the real page — including
     its own background footage — painted first and the splash popped in
     over it a moment later, which is the "shows the website, then the
     animation" gap. Defaulting to shown and correcting the disqualified
     cases (seen already, reduced motion) in a layout effect, which runs
     before the browser paints, means the only thing that can flash in
     that gap is this overlay's own ink background — never the page under
     it — and a returning visitor for whom it's disqualified never sees it
     at all. */
  const [active, setActive] = useState(true);
  const [phase, setPhase] = useState("in");
  const logoRef = useRef(null);

  useLayoutEffect(() => {
    let cancelled = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* "?intro=1" replays it on demand — useful while checking the timing,
       since the flag below otherwise means a tab only ever sees this once,
       silently, including the first time it happens to run after a code
       change during development. */
    const params = new URLSearchParams(location.search);
    const replay = params.get("intro") === "1";
    let seen = true;
    try { seen = sessionStorage.getItem(INTRO_KEY) === "1"; } catch {}
    if (reduced || (seen && !replay)) { setActive(false); return; }
    /* "&hold=5000" widens the middle step for a screenshot — never set on
       an actual visit, just a knob for checking the composition by eye. */
    const hold = Math.min(Math.max(Number(params.get("hold")) || 1750, 1750), 15000);

    /* Where it lands. A fixed vw/vh offset only ever approximates the
       header's own copy of the mark, so the swap at the end reads as a
       cut — the travelling badge stops short of, or past, where the real
       one actually sits. Measuring the header's element directly, right
       before the exit starts, means the transform ends with the two
       pixel-aligned, so removing the travelling one is invisible rather
       than a jump. */
    function aimAtHeader() {
      const target = document.querySelector(".wordmark-logo");
      const from = logoRef.current;
      if (!target || !from) return;
      const t = target.getBoundingClientRect();
      const f = from.getBoundingClientRect();
      if (!t.width || !f.width) return;
      const dx = (t.left + t.width / 2) - (f.left + f.width / 2);
      const dy = (t.top + t.height / 2) - (f.top + f.height / 2);
      from.style.setProperty("--exit-x", `${dx.toFixed(1)}px`);
      from.style.setProperty("--exit-y", `${dy.toFixed(1)}px`);
      from.style.setProperty("--exit-scale", (t.width / f.width).toFixed(4));
    }

    function finish() {
      if (cancelled) return;
      setActive(false);
      try { sessionStorage.setItem(INTRO_KEY, "1"); } catch {}
    }

    /* the mark settles first, like a compass needle finding north; the
       name is uncovered left to right underneath it, the way the road
       ahead uncovers itself; the rule is that same road, drawn once the
       name has arrived. Then it travels, still fully opaque, to exactly
       where the header's copy sits, while everything else here fades
       and hands the page over underneath it. */
    const toShown = setTimeout(() => { if (!cancelled) setPhase("shown"); }, 60);
    const toExit = setTimeout(() => {
      if (cancelled) return;
      aimAtHeader();
      setPhase("exit");
      /* Unmounting on a second fixed timer let a busy main thread — this
         page is running a canvas and several videos underneath — delay
         the *start* of this transition without delaying the *removal*
         by the same amount, which cut the travel short: it read as the
         mark just vanishing partway rather than arriving. Waiting for
         the real transitionend means it always plays out in full; the
         plain timeout under it is only a backstop in case that event
         never fires. */
      const img = logoRef.current;
      let settled = false;
      const onEnd = (e) => {
        if (e && e.propertyName !== "transform") return;
        if (settled) return;
        settled = true;
        img?.removeEventListener("transitionend", onEnd);
        finish();
      };
      if (img) {
        img.addEventListener("transitionend", onEnd);
        setTimeout(() => { if (!settled) { settled = true; finish(); } }, 900);
      } else {
        finish();
      }
    }, 60 + hold);

    return () => { cancelled = true; clearTimeout(toShown); clearTimeout(toExit); };
  }, []);

  if (!active) return null;

  return (
    <div
      className={"intro-splash" +
        (phase === "shown" || phase === "exit" ? " is-shown" : "") +
        (phase === "exit" ? " is-exit" : "")}
      aria-hidden="true"
    >
      {/* the Thar at dusk — a trip's own photograph, already trusted
          elsewhere on the site (it's Jodhpur & Jaisalmer's own fallback
          still), not a flat colour standing in for "travel" */}
      <img
        className="intro-splash-bg"
        src="https://images.unsplash.com/photo-1616693139578-f1c17deb0d4f?w=1600&q=70&auto=format&fit=crop"
        alt="" decoding="async" fetchPriority="high"
      />
      <div className="intro-splash-content">
        <img ref={logoRef} className="intro-splash-logo" src="/logo.png" alt="" width="220" height="220" decoding="async" />
        <span className="intro-splash-name">GHUMAKKAAD</span>
        <span className="intro-splash-rule" />
        <span className="intro-splash-tag">Every journey has a story</span>
      </div>
    </div>
  );
}

/* ---------- the page ---------- */

export default function Journey({ cards = [], slides = [], site = {} }) {
  const reduce = useReducedMotion();
  const live = useLiveConditions();

  const host = useRef(null);
  const intro = useRef(null);
  const highway = useRef(null);
  const backdrop = useRef(null);
  const grade = useRef(null);
  const canvas = useRef(null);
  const instrument = useRef(null);
  const progress = useRef(null);
  const gAlt = useRef(null);
  const gTemp = useRef(null);
  const gTempLabel = useRef(null);
  const gTerrain = useRef(null);
  const gDist = useRef(null);
  const gDistLabel = useRef(null);

  const refs = useMemo(
    () => ({
      host, backdrop, grade, canvas, instrument, progress,
      gauges: {
        alt: gAlt, temp: gTemp, tempLabel: gTempLabel,
        terrain: gTerrain, dist: gDist, distLabel: gDistLabel,
      },
    }),
    []
  );

  useSeasonBackdrop(refs, live);
  const rotation = useHeroRotation(slides.length);
  const manifesto = useManifestoLight(highway, MANIFESTO.length);

  /* Read straight off the scroll position into motion values: no state,
     so none of this costs a React render per frame. */
  const { scrollYProgress } = useScroll({
    target: intro,
    offset: ["start start", "end start"],
  });
  const liftY = useTransform(scrollYProgress, [0, 1], ["0px", "-72px"]);
  const liftOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1, 0]);
  const liftScale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);
  const heroLift = reduce ? undefined : { y: liftY, opacity: liftOpacity, scale: liftScale };

  /* The hero photography's visibility is NOT bound here. It is published
     by the backdrop engine as --hero-on, from the opening scene's own
     weight. A useTransform on a scroll target got stuck at full opacity
     past the intro and left an opaque layer over every video on the page,
     and a hero image is not worth a mechanism that can do that. */

  const whatsapp = site.whatsapp;
  const waLink = (msg) =>
    whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}` : "/packages";
  const askLink = waLink("Hi Ghumakkaad, I'd like the next departure dates.");
  const routed = cards.filter((c) => c.slug);

  return (
    <div className="journey" ref={host}>
      <IntroSplash />
      <div className="backdrop" ref={backdrop} aria-hidden="true" />
      {/* Kept out of #intro deliberately. Inside that section its z-index
          was resolved against the section's own stacking context, which put
          the photography on top of the headline instead of behind it. */}
      <HeroMedia slides={slides} active={rotation.active} reduce={rotation.reduce} />
      <div className="grade" ref={grade} aria-hidden="true" />
      <canvas className="weather-canvas" ref={canvas} aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="masthead">
        <Link className="wordmark" href="/">
          <img className="wordmark-logo" src="/logo.png" alt="" width="48" height="48" decoding="async" />
          GHUMAKKAAD
        </Link>
        <nav className="mast-nav" aria-label="Main">
          <Link href="/packages">Trips</Link>
          <a href="#outro">Contact</a>
          <a href={askLink} rel="noopener" target="_blank"
            onClick={() => trackWhatsApp("general", "header_nav")}>WhatsApp</a>
        </nav>
      </header>

      {/* A readout of the mix, and decoration only: every number in it
          is also stated in words inside the sections below. */}
      <aside className="instrument" ref={instrument} aria-hidden="true">
        <div className="progress" ref={progress} />
        <div className="gauge"><b ref={gAlt}>—</b><span>Elevation</span></div>
        <div className="gauge"><b ref={gTemp}>—</b><span ref={gTempLabel}>Right now</span></div>
        <div className="gauge"><b ref={gTerrain}>—</b><span>Where you are</span></div>
        <div className="gauge"><b ref={gDist}>—</b><span ref={gDistLabel}>Distance</span></div>
      </aside>

      <main>
        <section className="scene" id="intro" data-key="night" ref={intro} style={{ height: "190vh" }}>
          <div className="stage">
            {/* the hero lifts and dissolves as the road arrives, so it hands
                over to the journey instead of sliding away under it */}
            <motion.div className="content intro-title" style={heroLift}>
              {/* full width, because at 6rem "four seasons." does not fit
                  inside a half-width column and was breaking to three lines */}
              <Headline reduce={reduce} />

              <div className="hero-grid">
                <motion.p
                  className="lede"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0 }
                    : { duration: 0.9, delay: 0.5, ease: EASE }}
                >
                  Group trips out of Gujarat on dates that do not move. Scroll, and you go
                  through the whole year in about a minute.
                </motion.p>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduce ? { duration: 0 }
                    : { duration: 0.9, delay: 0.68, ease: EASE }}
                >
                  <HeroDepartures slides={slides} {...rotation} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="scene" id="highway" data-key="road" ref={highway} style={{ height: "340vh" }}>
          <div className="stage">
            <div className="content manifesto">
              {MANIFESTO.map((parts, i) => (
                <ManifestoLine key={i} parts={parts}
                  innerRef={(el) => { manifesto.current[i] = el; }} />
              ))}
            </div>
          </div>
        </section>

        {TERRAINS.map((terrain) => {
          const group = cards.filter((c) => c.terrain === terrain.key);
          return (
            <section
              className="scene" id={terrain.key} data-key={terrain.scene}
              key={terrain.key} style={{ height: terrain.height }}
            >
              <div className="stage">
                <div className="content terrain-head">
                  <Reveal as="h2" className="display display--sm">
                    {terrain.title[0]}<br />{terrain.title[1]}
                  </Reveal>
                  <Reveal as="p" className="lede" delay={0.1}>{terrain.lede}</Reveal>
                  {group.length > 0 && (
                    <div className="dockets" data-count={group.length}>
                      {group.map((card, i) => (
                        <Docket key={card.key} card={card} waLink={waLink} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}

        <section className="scene" id="outro" data-key="dawn" style={{ height: "260vh" }}>
          <div className="stage">
            <div className="content">
              <Reveal as="p" className="eyebrow">One message is all it takes</Reveal>
              <Reveal as="h2" className="display display--sm" delay={0.08}>
                Every journey<br />has a story.
              </Reveal>
              <Reveal as="p" className="lede lede--centred" delay={0.16}>
                Tell us which one you want. We send the next date, what is left, and what
                is included.
              </Reveal>
              <Reveal delay={0.24}>
                <motion.a
                  className="cta-big" href={askLink} rel="noopener" target="_blank"
                  onClick={() => trackWhatsApp("general", "outro_cta")}
                  whileHover={reduce ? undefined : { y: -3 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 340, damping: 24 }}
                >
                  {/* bold, not fill. Phosphor's fill weight paints the whole bubble solid
                      and knocks the handset out in the background colour, which at
                      this size on amber reads as a dark blob rather than as the
                      WhatsApp mark. Bold keeps the bubble and the handset as
                      strokes, so the mark is legible, and it matches the weight of
                      the mono caps beside it instead of overpowering them. It is
                      also the weight every other icon on the site already uses:
                      these four marks were the only ones set to fill. */}
                  <WhatsappLogo size={16} weight="bold" aria-hidden="true" />
                  {/* the label carries 0.14em of tracking, which leaves that much
                      dead space after its last letter and pushes the whole content
                      optically left inside the button. Cancelled here. */}
                  <span className="cta-label">Ask about a trip</span>
                </motion.a>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="colophon">
        <div className="colophon-grid">
          <div className="foot-brand">
            <img src="/logo.png" alt="" className="foot-mark" width="40" height="40" decoding="async" />
            <b>GHUMAKKAAD</b>
            <p>
              Group trips out of Gujarat. Fixed dates, one group, and someone from our
              side on the bus the whole way.
            </p>
            <ul>
              <li><a href={askLink} rel="noopener" target="_blank"
                onClick={() => trackWhatsApp("general", "footer")}>
                <WhatsappLogo size={15} weight="bold" aria-hidden="true" />WhatsApp us
              </a></li>
              {whatsapp && (
                <li><a href={`tel:+${whatsapp}`} onClick={() => trackCall("footer")}>
                  <Phone size={15} weight="bold" aria-hidden="true" />{site.phoneDisplay || "Call the trip desk"}
                </a></li>
              )}
              {site.email && (
                <li><a href={`mailto:${site.email}`} onClick={() => trackEmail("footer")}>
                  <EnvelopeSimple size={15} weight="bold" aria-hidden="true" />{site.email}
                </a></li>
              )}
              {site.instagram && (
                <li><a href={site.instagram} rel="noopener" target="_blank">
                  <InstagramLogo size={15} weight="bold" aria-hidden="true" />Instagram
                </a></li>
              )}
            </ul>
          </div>

          <div>
            <h4>Where to</h4>
            <ul>
              {/* prefetch off: these repeat on every page, and Next was
                  quietly prefetching all four terrain filters plus the
                  index on scroll-into-view for links most visits never
                  click — real mobile-data cost for near-zero benefit */}
              <li><Link href="/packages?terrain=snow" prefetch={false}>Snow and Himalaya</Link></li>
              <li><Link href="/packages?terrain=monsoon" prefetch={false}>Monsoon hills</Link></li>
              <li><Link href="/packages?terrain=desert" prefetch={false}>Desert and dunes</Link></li>
              <li><Link href="/packages?terrain=beach" prefetch={false}>Beach</Link></li>
              <li><Link href="/packages" prefetch={false}>All departures</Link></li>
            </ul>
          </div>

          <div>
            <h4>Every trip we run</h4>
            <ul>
              {routed.map((c) => (
                <li key={c.key}><Link href={`/packages/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
            <p className="foot-note">
              What is included, the cancellation charges and the questions we get asked
              are all on the trip page itself.
            </p>
          </div>
        </div>

        <div className="legal">
          <span>© {site.year} Ghumakkaad</span>
          <span style={{ display: "flex", gap: 14 }}>
            <Link href="/privacy" prefetch={false}>Privacy</Link>
            <Link href="/terms" prefetch={false}>Terms</Link>
            <Link href="/refund-policy" prefetch={false}>Cancellations &amp; refunds</Link>
          </span>
          <span>{site.tagline || "Every journey has a story"}</span>
          <a href="#" className="back-top">
            <ArrowUp size={11} weight="bold" aria-hidden="true" />Back to top
          </a>
        </div>
      </footer>
    </div>
  );
}
