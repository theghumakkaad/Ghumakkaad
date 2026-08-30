"use client";
import { useEffect } from "react";

/* ============================================================
   The scroll engine, as a hook.
   Backgrounds are measured from the sections they name, so
   editing an itinerary can never knock them out of step.
   ============================================================ */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

export function useJourney(scenes) {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scenesBox = document.getElementById("scenes");
    const tintEl = document.getElementById("tint");
    if (!scenesBox) return;

    /* was "360" on mobile, same softness problem as the home page backdrop —
       bumped to match desktop's primary tier, with "360" kept as the
       fallback below in case a specific clip id lacks a 720p file. */
    const Q = "720";
    const mk = (id) => `https://assets.mixkit.co/videos/${id}/${id}-${Q}.mp4`;

    /* ---- build the backdrop stack ---- */
    scenesBox.innerHTML = "";
    const layers = (scenes || []).map((sc, i) => {
      const d = document.createElement("div");
      d.className = "scene-layer";
      if (i === 0) d.style.opacity = "1";
      if (sc.type === "image") {
        const im = document.createElement("img");
        im.src = sc.src; im.alt = ""; im.decoding = "async";
        im.addEventListener("error", () => im.remove(), { once: true });
        im.className = "ken" + (i % 2 ? " ken--slow" : "");
        d.appendChild(im);
      } else {
        const v = document.createElement("video");
        v.dataset.src = sc.src; v.muted = true; v.loop = true; v.playsInline = true;
        v.preload = "none";
        v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
        if (i === 0) v.autoplay = true;
        d.appendChild(v);
      }
      scenesBox.appendChild(d);
      const tint = String(sc.tint || "0,0,0,.3").split(",").map(Number);
      return { el: d, video: d.querySelector("video"), tint,
               anchor: sc.anchor, frac: sc.frac ?? 0.5, rain: sc.rain ?? 0.3,
               at: 0, span: 0.15, playing: false };
    });

    function loadVideo(v) {
      if (!v || !v.dataset?.src || v.src) return;
      const id = v.dataset.src;
      const chain = innerWidth < 760 ? ["720", "360"] : ["720", "1080", "360"];
      let step = 0;
      v.preload = "auto";
      v.src = mk(id);
      v.addEventListener("error", function fb() {
        step++;
        if (step < chain.length) {
          v.src = `https://assets.mixkit.co/videos/${id}/${id}-${chain[step]}.mp4`;
          v.play().catch(() => {});
        } else v.removeEventListener("error", fb);
      });
      v.play().catch(() => {});
    }
    if (layers[0]) loadVideo(layers[0].video);
    const warm = setTimeout(() => layers[1] && loadVideo(layers[1].video), 600);

    /* Where each backdrop sits, as a fraction of total scroll, measured
       from the section it names.

       The span is how far either side of that point the layer stays
       visible, and it has to reach far enough to meet its neighbours.
       At 62% of the distance to the nearest one, capped at 0.18, windows
       barely touched: measured across Jodhpur & Jaisalmer, only 2 of 81
       sampled scroll positions had two backdrops on screen at once, so a
       change of scene arrived as a cut rather than a dissolve. Day 2 of
       that trip anchors two scenes, which is why it was most obvious
       there. Reaching 90% of the way to the nearest neighbour puts the
       same page at 19 of 81. */
    function anchorScenes() {
      const docH = document.documentElement.scrollHeight - innerHeight;
      if (docH <= 0) return;
      lastDocH = docH;
      layers.forEach((L) => {
        if (!L.anchor) return;
        const sec = document.querySelector(L.anchor);
        if (!sec) return;
        L.at = clamp((sec.offsetTop + sec.offsetHeight * L.frac - innerHeight * 0.5) / docH, 0, 1);
      });
      layers.forEach((L, j) => {
        const prev = j > 0 ? Math.abs(L.at - layers[j - 1].at) : Infinity;
        const next = j < layers.length - 1 ? Math.abs(layers[j + 1].at - L.at) : Infinity;
        const nearest = Math.min(prev, next);
        L.span = clamp(Number.isFinite(nearest) ? nearest * 0.9 : 0.24, 0.1, 0.34);
      });
    }

    let rainScale = 0.3;
    let lastDocH = 0;

    function paintScenes(p) {
      /* 2.2 made the nearest layer take essentially all the weight, so
         transitions read as cuts. 1.5 leaves both sides of a crossfade
         genuinely visible through the middle of it. */
      const w = layers.map((L) =>
        Math.pow(smooth(1 - Math.min(1, Math.abs(p - L.at) / (L.span || 0.15))), 1.5));
      let sum = w.reduce((a, b) => a + b, 0);

      /* A guard rather than a fix for anything observed. The old code did
         `sum = reduce(...) || 1`, so if a reader ever landed outside every
         window the normaliser divided by 1 and every layer went to opacity
         zero, showing bare #sky. Widening the windows above should make
         that unreachable; this makes it harmless if it is not. */
      if (sum < 1e-4) {
        let nearest = 0, best = Infinity;
        layers.forEach((L, i) => {
          const d = Math.abs(p - L.at);
          if (d < best) { best = d; nearest = i; }
        });
        w[nearest] = 1;
        sum = 1;
      }
      let rain = 0, r = 0, g = 0, b = 0, a = 0;
      layers.forEach((L, i) => {
        const k = w[i] / sum;
        L.el.style.opacity = k.toFixed(3);
        if (!reduced && L.video) {
          if (k > 0.0015) loadVideo(L.video);
          if (k > 0.03 && !L.playing && L.video.src) { L.video.play().catch(() => {}); L.playing = true; }
          else if (k <= 0.03 && L.playing) { L.video.pause(); L.playing = false; }
        }
        rain += L.rain * k;
        r += L.tint[0] * k; g += L.tint[1] * k; b += L.tint[2] * k; a += L.tint[3] * k;
      });
      rainScale = rain;
      if (tintEl)
        tintEl.style.background =
          `linear-gradient(180deg, rgba(${r | 0},${g | 0},${b | 0},${(a * 0.55).toFixed(3)}) 0%,` +
          ` rgba(${r | 0},${g | 0},${b | 0},0) 48%,` +
          ` rgba(${r | 0},${g | 0},${b | 0},${(0.3 + a * 0.22).toFixed(3)}) 100%)`;
    }

    /* ---- day headings: characters folded flat by the scroll itself ----
       Scoped to .day h2 on purpose. This used to run on every h2 in
       main, so "What you get" and "Questions" were also split into
       per-character spans and measured on every scroll frame, and a
       remount skipped the already-wrapped ones and left them stranded
       at 6% opacity. Originals are kept so the cleanup can put the
       real text back and React is never handed foreign DOM. */
    const charSpans = (text) =>
      '<span class="kin">' +
      text.split(/\s+/).map((w) =>
        '<span class="kw">' + w.split("").map((c) => `<span class="kc">${c}</span>`).join("") + "</span>"
      ).join(" ") + "</span>";

    let kinetic = [];
    if (!reduced) {
      document.querySelectorAll(".day h2").forEach((h) => {
        const text = h.dataset.kinText || h.textContent.trim();
        if (!h.dataset.kin) {
          h.dataset.kin = "1";
          h.dataset.kinText = text;
          h.innerHTML = charSpans(text);
        }
        kinetic.push({ el: h, text, chars: [...h.querySelectorAll(".kc")] });
      });
    }
    function moveKinetic() {
      kinetic.forEach((k) => {
        const r = k.el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > innerHeight + 80) return;
        const p = clamp((innerHeight * 0.98 - r.top) / (innerHeight * 0.38), 0, 1);
        if (p >= 1 && k.done) return;
        k.done = p >= 1;
        const n = k.chars.length;
        k.chars.forEach((ch, c) => {
          const lead = c / (n * 2.6);
          const t = clamp((p - lead) / (1 - lead || 1), 0, 1);
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          ch.style.transform =
            `translateY(${((1 - e) * 78).toFixed(1)}%) rotateX(${((1 - e) * -82).toFixed(0)}deg) scale(${(0.86 + e * 0.14).toFixed(3)})`;
          ch.style.opacity = (0.06 + e * 0.94).toFixed(3);
        });
      });
    }

    /* ---- the hero plays itself, it is on screen before any scroll ---- */
    const hero = document.getElementById("heroTitle");
    let heroText = null;
    const heroTimers = [];
    if (hero && !reduced) {
      heroText = hero.dataset.kinText || hero.textContent.trim();
      hero.dataset.kinText = heroText;
      hero.innerHTML = charSpans(heroText).replace('class="kin"', 'class="kin kin--intro"');
      const chars = [...hero.querySelectorAll(".kc")];
      chars.forEach((ch) => {
        ch.style.transform = "translateY(90%) rotateX(-88deg) scale(.9)";
        ch.style.opacity = "0";
      });
      const play = () => chars.forEach((ch, i) => heroTimers.push(setTimeout(() => {
        ch.style.transform = "translateY(0) rotateX(0deg) scale(1)";
        ch.style.opacity = "1";
      }, 90 + i * 60)));
      /* wait for the display face so letters do not jump width mid-fold */
      if (document.fonts?.ready) document.fonts.ready.then(play, play);
      else play();
    }

    /* ---- the schedule plays while its day is pinned ---- */
    const reels = [...document.querySelectorAll(".day")].map((sec) => ({
      sec, list: sec.querySelector(".acts"),
      items: [...sec.querySelectorAll(".acts li")],
      inner: sec.querySelector(".day-in"), head: sec.querySelector("h2"),
    }));
    function playReels() {
      if (reduced) return;
      reels.forEach((R) => {
        if (!R.items.length) return;
        const box = R.sec.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) return;
        const travel = R.sec.offsetHeight - innerHeight;
        const p = clamp(-box.top / (travel || 1), 0, 1);
        const q = clamp((p - 0.12) / 0.76, 0, 1);
        const active = q * (R.items.length - 1);
        const lo = Math.floor(active), hi = Math.min(lo + 1, R.items.length - 1);
        const frac = active - lo;
        const yLo = R.items[lo].offsetTop + R.items[lo].offsetHeight / 2;
        const yHi = R.items[hi].offsetTop + R.items[hi].offsetHeight / 2;
        R.list.style.transform = `translateY(${(-(yLo + (yHi - yLo) * frac)).toFixed(1)}px)`;
        R.items.forEach((it, i) => {
          const d = Math.abs(i - active);
          /* the floor used to be 0.5, which left every other line of the
             itinerary competing with the one being read */
          it.style.opacity = Math.max(0.16, 1 - d * 0.34).toFixed(3);
          it.style.transform = `translateX(${Math.min(d * 8, 22).toFixed(1)}px) scale(${Math.max(0.92, 1 - d * 0.045).toFixed(3)})`;
          it.classList.toggle("live", d < 0.5);
        });
        if (R.inner) R.inner.style.transform = `translateY(${(26 - p * 52).toFixed(1)}px)`;
        if (R.head) R.head.style.transform = `translateX(${(-p * 30).toFixed(1)}px)`;
      });
    }

    /* ---- reveals ---- */
    let io;
    if (!reduced) {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); }
      }), { threshold: 0.2 });
      document.querySelectorAll("main .pre").forEach((el) => io.observe(el));
    }

    /* ---- weather ---- */
    const cv = document.getElementById("rain");
    let raf, drops = [], W = 0, H = 0, last = performance.now();
    const ctx = cv?.getContext("2d");
    function sizeRain() {
      if (!cv) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.round((W * H) / 5200), 70, 300);
      drops = Array.from({ length: n }, () => ({
        x: Math.random() * W * 1.2 - W * 0.1, y: Math.random() * H,
        d: 0.18 + Math.random() * 0.82, len: 12 + Math.random() * 30,
      }));
    }
    function rain(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      ctx.clearRect(0, 0, W, H);
      const live = Math.round(drops.length * rainScale * 0.8);
      for (let i = 0; i < live; i++) {
        const q = drops[i];
        q.y += (q.d * 1150 + 380) * dt; q.x += q.d * 34 * dt;
        if (q.y > H + 30) { q.y = -30; q.x = Math.random() * W * 1.2 - W * 0.1; }
        const len = q.len * (0.6 + q.d);
        const g = ctx.createLinearGradient(q.x, q.y - len, q.x, q.y);
        const a = (0.025 + q.d * 0.09) * rainScale;
        g.addColorStop(0, "rgba(230,238,240,0)");
        g.addColorStop(1, `rgba(230,238,240,${a.toFixed(3)})`);
        ctx.strokeStyle = g; ctx.lineWidth = 0.5 + q.d * 0.9;
        ctx.beginPath(); ctx.moveTo(q.x, q.y - len); ctx.lineTo(q.x + q.d * 1.5, q.y); ctx.stroke();
      }
      raf = requestAnimationFrame(rain);
    }
    if (!reduced && ctx) { sizeRain(); raf = requestAnimationFrame(rain); }

    function onScroll() {
      const docH = document.documentElement.scrollHeight - innerHeight;
      paintScenes(docH > 0 ? clamp(scrollY / docH, 0, 1) : 0);
      moveKinetic();
      playReels();
    }
    function onResize() { anchorScenes(); sizeRain(); onScroll(); }

    anchorScenes();
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("load", onResize);

    /* The anchors are fractions of total scroll height, so they are wrong
       until the page has stopped growing. It only measured on mount, and
       the display face swapping in reflows every panel underneath, which
       left every backdrop sitting at the wrong point on the page. */
    let ro;
    if (typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => {
        const docH = document.documentElement.scrollHeight - innerHeight;
        if (Math.abs(docH - lastDocH) < 4) return;
        anchorScenes();
        onScroll();
      });
      ro.observe(document.body);
    }
    document.fonts?.ready.then(() => { anchorScenes(); onScroll(); }, () => {});

    return () => {
      clearTimeout(warm);
      heroTimers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("load", onResize);
      /* hand the headings back as plain text, and stop the clips */
      kinetic.forEach((k) => { k.el.textContent = k.text; delete k.el.dataset.kin; });
      if (hero && heroText) { hero.textContent = heroText; }
      layers.forEach((L) => {
        if (!L.video) return;
        L.video.pause();
        L.video.removeAttribute("src");
        L.video.load();
      });
      scenesBox.innerHTML = "";
    };
  }, [scenes]);
}
