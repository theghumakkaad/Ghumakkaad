"use client";
import { useEffect, useRef } from "react";
import { DESTS } from "./useSeasonBackdrop";

/* ============================================================
   Where the reader is, and what the weather is doing there and
   at each destination. Both lookups are optional decoration: if
   either is blocked, offline, or slow, the gauges quietly fall
   back to the averages baked into the scene config.

   Results land in a ref rather than state on purpose. The gauges
   are painted by the animation loop, so a re-render every fifteen
   minutes would buy nothing and would restart the loop.
   ============================================================ */
export function useLiveConditions() {
  const live = useRef({ city: null, lat: null, lon: null, temp: null, destTemps: {} });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let timer = 0;

    async function locate() {
      try {
        const r = await fetch("https://ipwho.is/", { signal });
        const j = await r.json();
        if (j && j.success !== false && j.latitude) {
          live.current.city = j.city || j.region || null;
          live.current.lat = j.latitude;
          live.current.lon = j.longitude;
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.info("[Ghumakkaad] Location lookup unavailable, using trip averages.");
        }
      }
    }

    async function weather() {
      const keys = Object.keys(DESTS);
      const lats = keys.map((k) => DESTS[k].lat);
      const lons = keys.map((k) => DESTS[k].lon);
      if (live.current.lat != null) { lats.push(live.current.lat); lons.push(live.current.lon); }

      try {
        const url =
          "https://api.open-meteo.com/v1/forecast" +
          `?latitude=${lats.join(",")}&longitude=${lons.join(",")}` +
          "&current=temperature_2m&timezone=auto";
        const r = await fetch(url, { signal });
        const data = await r.json();
        const rows = Array.isArray(data) ? data : [data];
        rows.forEach((row, i) => {
          const t = row?.current?.temperature_2m;
          if (typeof t !== "number") return;
          if (i < keys.length) live.current.destTemps[keys[i]] = t;
          else live.current.temp = t;
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.info("[Ghumakkaad] Live weather unavailable, using trip averages.");
        }
      }
    }

    (async () => {
      await locate();
      if (signal.aborted) return;
      await weather();
      if (signal.aborted) return;
      timer = setInterval(weather, 15 * 60 * 1000);
    })();

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  return live;
}
