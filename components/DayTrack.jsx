"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ============================================================
   Where you are in the trip, and a way to jump.

   Only the active day is tracked, which changes rarely, so state is
   the right tool. There is no per-frame work here at all any more.

   The day number comes from the day's own label, so a trip that
   starts at Day 1 is not renumbered from zero by its position.
   ============================================================ */
export default function DayTrack({ days }) {
  const [active, setActive] = useState(-1);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const sections = [...document.querySelectorAll(".day")];
      if (!sections.length) return;
      let idx = -1;
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (idx === -1 && r.top <= innerHeight * 0.45 && r.bottom >= innerHeight * 0.45) idx = i;
      });
      setActive(idx);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const label = (d, i) => {
    const raw = d.tag || "";
    const num = raw.match(/day\s*(\d+)/i);
    const name = raw.split(/[·•|]/).pop().trim();
    return { num: num ? num[1] : String(i), name: name || d.title };
  };

  return (
    <nav id="dayTrack" className={active >= 0 ? "on" : ""} aria-label="Trip days">
      {/* The progress line that used to run along the top of this is gone,
          and so is the marker that slid between tabs: both were coloured
          rules travelling across the page, and the sliding one used the
          same layout projection that misfired in the hero. The tab you are
          on is simply the tab that is filled. */}
      <div className="dt-inner">
        <div className="dt-list">
          {days.map((d, i) => {
            const l = label(d, i);
            const on = i === active;
            return (
              <button
                key={i} type="button" className={"dt-day" + (on ? " on" : "")}
                aria-current={on ? "step" : undefined}
                onClick={() =>
                  document.getElementById("d" + i)?.scrollIntoView({
                    behavior: reduce ? "auto" : "smooth", block: "start",
                  })
                }
              >
                <b>{l.num}</b><span>{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
