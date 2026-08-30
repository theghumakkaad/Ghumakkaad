"use client";
import { useEffect } from "react";

/* ============================================================
   THE BLEND ENGINE

   The landing page is one continuous backdrop, not a stack of
   pages. Every scene gets a weight from how close it is to the
   centre of the viewport; the weights are normalised, and the
   footage, colour grade, weather particles and corner gauges are
   all mixed from the same numbers. So terrain melts into terrain.

   This runs outside React on purpose: it repaints at frame rate,
   and pushing 60 state updates a second through the reconciler
   would be the wrong tool. Everything it touches is reached
   through a ref, and everything it starts is torn down in the
   cleanup below. It used to leak a requestAnimationFrame loop, a
   fifteen-minute interval and three IntersectionObservers on
   unmount; that is what the returned teardown is for.
   ============================================================ */

/* ============================================================
   THE SEQUENCE

   Seven scenes, and each one is either footage or a photograph, never
   both. Previously every terrain carried a still behind its clip as a
   poster, so an image appeared for however long that clip took to
   arrive and then vanished. Which image you saw, and for how long,
   depended entirely on your connection. Three deliberate stills sit in
   the run instead: one after the road, one before the desert, one
   after it. That also takes the page from seven clips down to four.

   Each clip carries a `plate`: a graded colour plate generated for this
   site and served from our own origin, set as the video's poster. It is
   not a photograph and is not pretending to be one, it is the light of
   that place, and it means the first screen has depth the instant it
   paints rather than being a black rectangle while a clip negotiates
   its way across the network. `base` is a CSS gradient under that
   again, for when even the plate has not arrived.

   The closing sunrise used to be seeked frame by frame from the scroll
   position, one currentTime write per frame, which is the stutter at
   the end of the page. It loops like the rest now.
   ============================================================ */

const UNSPLASH = (id) => `https://images.unsplash.com/${id}?w=1800&q=72&auto=format&fit=crop`;

const SCENES = {
  /* This was Mixkit clip 9678, "night fog in the city highway" — real
     footage, but under this scene's own dark grade the fog reads as a lit
     tunnel mouth rather than a road, which is not what the very first
     thing a visitor sees should look like. 1585 is the site's own "road"
     clip one section down — cars on a two-way street at night, which is
     actually a road — reused here instead, so the opening scene shows a
     road rather than sitting a section early. */
  night: {
    plate: "/backdrop/night.webp",
    video: "1585", field: null, alt: 53, temp: 29,
    tint: [10, 11, 16, 0.55], acc: ["#FFB524", "#C97A08"],
    base: "radial-gradient(85% 62% at 50% 104%, #6B4410 0%, #33210C 34%, #14111A 68%, #06070C 100%),"
        + " radial-gradient(50% 34% at 78% 12%, #1B2138 0%, transparent 100%)",
  },
  /* The manifesto lines run over real footage again, not the generated
     plate. The plate was a flat, near-black gradient with no photography
     in it at all — behind a "read" it looked like the section had lost
     its background rather than chosen a quiet one. */
  road: {
    plate: "/backdrop/road.webp",
    video: "1585", field: null, alt: 120, temp: 28,
    tint: [10, 11, 16, 0.62], acc: ["#FFB524", "#C97A08"],
    base: "radial-gradient(78% 58% at 50% 100%, #8A5713 0%, #3E280B 32%, #17130F 66%, #06070C 100%)",
  },
  /* still 1 of 3: the road has turned white */
  snow: {
    image: "photo-1542986949-cd1d830d0f86", field: "snow", alt: 3978, temp: -4,
    tint: [16, 32, 46, 0.45], acc: ["#D7E3EE", "#7C9CB8"], place: "manali",
    base: "linear-gradient(168deg, #33556E 0%, #16283A 52%, #070C14 100%)",
  },
  /* still 2 of 3: monsoon, immediately before the desert */
  rain: {
    image: "photo-1470071459604-3b5ec3a7fe05", field: "rain", alt: 1000, temp: 21,
    tint: [8, 22, 15, 0.5], acc: ["#8FD08A", "#22574A"], place: "saputara",
    base: "linear-gradient(168deg, #2C5B49 0%, #12301F 54%, #050D0A 100%)",
  },
  sand: {
    plate: "/backdrop/sand.webp",
    video: "4149", field: "sand", alt: 225, temp: 41,
    tint: [42, 20, 9, 0.45], acc: ["#F2C15B", "#DB6B25"], place: "jaisalmer",
    base: "linear-gradient(168deg, #A9541A 0%, #4A2109 50%, #100803 100%)",
  },
  /* still 3 of 3: where the road ends */
  sea: {
    image: "photo-1512343879784-a960bf40e7f2", field: "sea", alt: 0, temp: 31,
    tint: [4, 37, 43, 0.42], acc: ["#6FD8D2", "#0E6F76"], place: "goa",
    base: "linear-gradient(168deg, #12707A 0%, #0A3A42 52%, #03161A 100%)",
  },
  dawn: {
    plate: "/backdrop/dawn.webp",
    video: "50199", field: null, alt: 53, temp: 30,
    tint: [30, 14, 4, 0.35], acc: ["#FFC46B", "#D9721F"],
    base: "radial-gradient(120% 100% at 50% 96%, #C4731A 0%, #4A2409 44%, #0C0A10 100%)",
  },
};

export const DESTS = {
  manali:    { lat: 32.24, lon: 77.19, label: "Manali" },
  saputara:  { lat: 20.57, lon: 73.75, label: "Saputara" },
  jaisalmer: { lat: 26.91, lon: 70.92, label: "Jaisalmer" },
  goa:       { lat: 15.49, lon: 73.83, label: "Goa" },
};

const TERRAIN_LABEL = {
  night: "On the way", road: "On the way", snow: "Himachal",
  rain: "Saputara", sand: "Thar", sea: "Goa", dawn: "Back home",
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const fmt = (n) => Math.round(n).toLocaleString("en-IN");
const rand = (a, b) => a + Math.random() * (b - a);
const hex2rgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

const haversine = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180, dLat = (c - a) * r, dLon = (d - b) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

/* ============================================================
   ATMOSPHERE

   Rain, snow and blowing sand, drawn on one canvas over the footage.

   What changed, and why the old version read as an effect rather than as
   weather:

   1. Every field invented its own drift. Snow swayed on a per-flake sine,
      rain fell at a fixed 22% slant no matter what, sand always blew left
      at a constant rate, and nothing ever gusted. There is now ONE wind for
      the whole page, with a slow base oscillation and a gust envelope, and
      all three fields read from it. They lean over together.

   2. Depth was a single number that scaled size and speed and nothing else.
      It is now three discrete planes, and the plane decides parallax
      response, softness and opacity as well. Far snow barely reacts to a
      gust; near snow gets shoved across the frame.

   3. Rain streaks pointed one way while the drop travelled another, which
      is the tell that makes CSS rain look like falling sticks. A streak is
      now drawn along the drop's actual velocity vector and its length comes
      from its actual speed, which is what motion blur is.

   4. Nothing arrived anywhere. Rain now breaks at the bottom of the frame,
      and lightning is a multi-stroke flicker with a bright top rather than
      one flat white rectangle.

   5. Sand was a uniform field of identical streaks. Real blowing sand is
      mostly saltation, a dense fast layer hugging the ground, under a few
      broad translucent veils of dust. Both are here now.

   Performance, because this runs over playing video and often on a phone:
   particle counts went DOWN, not up. The realism is in the motion, not the
   count. Alpha and stroke state are set once per depth plane rather than
   once per particle, lines are batched into one Path2D per plane, and snow
   is a pre-rendered sprite drawn with drawImage rather than a fresh radial
   gradient per flake per frame.
   ============================================================ */

/* far to near. depth drives size and speed, drag drives how hard the wind
   pushes this plane around, alpha is the plane's own weight in the mix */
const PLANES = [
  { depth: 0.40, drag: 0.30, alpha: 0.34, share: 0.44 },
  { depth: 0.70, drag: 0.62, alpha: 0.62, share: 0.34 },
  { depth: 1.00, drag: 1.00, alpha: 1.00, share: 0.22 },
];

class Wind {
  constructor() { this.x = 0; this.gust = 0; this.target = 0; this.timer = 1.5; this.strength = 0; }
  step(dt, t, energy) {
    /* a gust arrives, holds, and falls away; between gusts the air still
       moves, on two incommensurate periods so it never visibly repeats */
    this.timer -= dt;
    if (this.timer <= 0) {
      this.target = Math.random() < 0.45 ? rand(0.55, 1.5) : 0;
      this.timer = rand(2.4, 7.5);
    }
    this.gust += (this.target - this.gust) * Math.min(1, dt * 1.5);
    const base = Math.sin(t * 0.11) * 0.5 + Math.sin(t * 0.29 + 1.3) * 0.22;
    /* scrolling fast is its own wind: the reader is in a moving bus */
    this.x = base + this.gust * 1.2 + energy * 0.55;
    this.strength = Math.abs(base) + this.gust + energy * 0.5;
  }
}

/* A soft flake, rendered once. Drawing a radial gradient per flake per
   frame is the single most expensive thing this canvas could do; drawing a
   cached bitmap is close to free, and it is the only way to get a flake
   that is actually soft at the edge rather than a hard little disc. */
/* A veil of dust, rendered once. Three createLinearGradient calls plus
   three large fillRects every frame was measurably the most expensive thing
   on the page: hiding the canvas entirely on the desert scene bought 5fps,
   and this was nearly all of it. A cached bitmap stretched with drawImage
   costs almost nothing and looks the same. */
function veilSprite(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(8, Math.round(w)); c.height = Math.max(8, Math.round(h));
  const g2 = c.getContext("2d");
  /* Soft on ALL FOUR sides. The first version faded left and right only and
     left the top and bottom square, so each veil showed up as a pair of hard
     horizontal edges straight across the dune field: a visible rectangle,
     which is the same mistake the quote scrim made. An ellipse drawn through
     a radial gradient has no edge anywhere. */
  g2.translate(c.width / 2, c.height / 2);
  g2.scale(c.width / c.height, 1);
  const r = c.height / 2;
  const grad = g2.createRadialGradient(0, 0, 0, 0, 0, r);
  grad.addColorStop(0, "rgba(232,196,138,1)");
  grad.addColorStop(0.42, "rgba(232,196,138,0.62)");
  grad.addColorStop(0.78, "rgba(228,188,128,0.16)");
  grad.addColorStop(1, "rgba(226,186,124,0)");
  g2.fillStyle = grad;
  g2.beginPath(); g2.arc(0, 0, r, 0, 6.283); g2.fill();
  return c;
}

function flakeSprite(r) {
  const c = document.createElement("canvas");
  const size = Math.max(4, Math.ceil(r * 4));
  c.width = c.height = size;
  const g2 = c.getContext("2d");
  const half = size / 2;
  const grad = g2.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(244,250,255,0.95)");
  grad.addColorStop(0.4, "rgba(228,241,252,0.55)");
  grad.addColorStop(1, "rgba(220,236,252,0)");
  g2.fillStyle = grad;
  g2.beginPath(); g2.arc(half, half, half, 0, 6.283); g2.fill();
  return c;
}

class Field {
  constructor(kind, ctx, wind) {
    this.kind = kind; this.ctx = ctx; this.wind = wind;
    this.p = []; this.drops = []; this.veils = []; this.sprites = [];
    this.flash = 0; this.strokes = 0; this.boltAt = 0.5;
    this.W = 0; this.H = 0;
  }

  resize(W, H) {
    this.W = W; this.H = H;
    /* Density per field, and it is deliberately HIGH.

       My first pass cut the count to 170 for all four fields on the theory
       that the realism is in the motion. Half right: the motion is what
       makes it read as weather rather than as a screensaver, but 170
       particles spread over three depth planes across a 1440px frame is
       about a dozen visible per plane, and a dozen streaks is drizzle. A
       monsoon hillside and a sandstorm are both, above all, DENSE.

       What made the density affordable is the batching, not luck: alpha and
       stroke state are set three times a frame instead of once per
       particle, so the marginal cost of another grain is one more segment
       in a Path2D that was already being stroked. Measured with the canvas
       hidden, the whole field costs about 4fps of a software-rendered
       ceiling, and these counts did not move that.

       Snow is the exception and is kept lower: each flake is its own
       drawImage, which cannot be batched, and a soft flake reads at much
       lower density than a hard streak anyway. */
    const per = { snow: 4200, rain: 2600, sand: 2300, sea: 8000 }[this.kind] || 6000;
    const mobile = W < 760 ? 0.55 : 1;
    const n = clamp(Math.round(((W * H) / per) * mobile), 40, 620);
    this.p = [];
    PLANES.forEach((_, i) => {
      const count = Math.max(4, Math.round(n * PLANES[i].share));
      for (let k = 0; k < count; k++) this.p.push(this.spawn(i));
    });
    this.drops.length = 0;

    if (this.kind === "snow") {
      this.sprites = PLANES.map((pl) => flakeSprite(clamp(pl.depth * 3, 1.2, 3.2)));
    }
    if (this.kind === "sand") {
      /* broad, slow, barely-there sheets of dust. These do more for "hot
         desert wind" than any number of streaks, because they are what
         actually obscures a dune field. */
      this.veils = Array.from({ length: 3 }, () => ({
        x: rand(-W, W), y: H * rand(0.44, 0.9),
        w: W * rand(0.55, 1.15), h: H * rand(0.10, 0.2),
        sp: rand(26, 66), a: rand(0.09, 0.17),
      }));
      /* one bitmap, stretched per veil */
      this.veil = veilSprite(384, 96);
      /* and the ground haze, which only depends on the viewport */
      this.haze = this.ctx.createLinearGradient(0, H * 0.4, 0, H);
      this.haze.addColorStop(0, "rgba(224,140,52,0)");
      this.haze.addColorStop(1, "rgba(214,120,40,.22)");
    }
  }

  spawn(plane, seeded = true) {
    const { W, H, kind } = this;
    const pl = PLANES[plane];
    const d = clamp(pl.depth * rand(0.85, 1.15), 0.18, 1.2);
    const base = { pl: plane, d, ph: rand(0, 6.283) };

    if (kind === "snow") {
      return { ...base, x: rand(-W * 0.1, W * 1.1), y: seeded ? rand(-H, H) : -20,
               /* terminal velocity: a big wet flake falls faster than a
                  small dry one, and tumbles more while doing it */
               sp: d * 34 + 9, tumble: rand(0.5, 1.6), sway: rand(10, 30) };
    }
    if (kind === "rain") {
      return { ...base, x: rand(-W * 0.25, W * 1.05), y: seeded ? rand(-H, H) : rand(-H * 0.4, -20),
               sp: d * 900 + 380, vx: 0, vy: 0 };
    }
    if (kind === "sand") {
      /* most of the material is saltation: grains bouncing along within a
         hand's width of the ground, far denser and faster than the dust
         above it */
      const salt = Math.random() < 0.66;
      return { ...base, salt,
               x: rand(0, W),
               /* the saltation layer sits in the bottom third and is where
                  most of the material is; above it, thinner airborne dust */
               y: salt ? rand(H * 0.62, H * 0.99) : rand(H * 0.12, H * 0.72),
               sp: (salt ? d * 520 + 260 : d * 300 + 120),
               /* streaks are not all dead level: a grain crossing the frame
                  is also rising or falling a little */
               rise: rand(-2.2, 3.4),
               hop: rand(0, 6.283), hopSp: rand(2.4, 5.2) };
    }
    /* Sea: specular glints on wavelets, not floating motes. These used to
       rise up the frame like bubbles, which is the wrong direction for
       looking AT water, and each one cost its own alpha write and its own
       arc fill: 54 canvas state changes a frame, the most expensive field on
       the page once the others were batched.

       A glint is a short horizontal dash, because that is the shape of a sun
       reflection on a moving facet, and it winks in and out by changing
       LENGTH rather than opacity. That is both what really happens as the
       facet turns, and what lets the whole plane share one alpha. */
    return { ...base, x: rand(0, W), y: rand(H * 0.42, H * 0.98),
             len: d * 9 + 2.5, sp: d * 7 + 2, tw: rand(1.1, 2.8) };
  }

  step(dt, energy, t) {
    const { W, H, kind } = this;
    const w = this.wind;
    const g = 1 + energy * 1.6;

    for (const q of this.p) {
      const pl = PLANES[q.pl];
      const push = w.x * pl.drag;

      if (kind === "snow") {
        /* Flutter, not a sine. Two frequencies beating against each other
           read as a flake tumbling and catching the air; one frequency
           reads as a pendulum, which is what it looked like before. */
        const flutter =
          Math.sin(t * (0.7 * q.tumble) + q.ph) * q.sway +
          Math.sin(t * (1.9 * q.tumble) + q.ph * 2.1) * q.sway * 0.45;
        q.y += q.sp * dt * g;
        /* a small flake has less mass and is thrown much further by the
           same gust than a large one */
        q.x += (flutter * q.d + push * (150 - q.d * 70)) * dt;
        if (q.y > H + 12) Object.assign(q, this.spawn(q.pl, false));
        if (q.x > W * 1.12) q.x = -W * 0.1;
        if (q.x < -W * 0.12) q.x = W * 1.1;

      } else if (kind === "rain") {
        /* velocity is kept, because the streak is drawn along it */
        q.vy = q.sp * g;
        q.vx = q.sp * (0.12 + push * 0.34);
        q.y += q.vy * dt;
        q.x += q.vx * dt;
        if (q.y > H) {
          /* it lands. Only the near plane splashes: a splash from a drop
             that is supposed to be 40 metres away is a mistake you can
             feel even if you cannot name it. */
          if (q.pl === PLANES.length - 1 && this.drops.length < 26) {
            this.drops.push({ x: q.x, y: H - rand(0, H * 0.02), life: 1, r: rand(2, 5) });
          }
          Object.assign(q, this.spawn(q.pl, false));
        }
        if (q.x > W * 1.1) q.x = -W * 0.2;

      } else if (kind === "sand") {
        /* grains bounce: a hop carries them up off the surface and drops
           them back. Above the saltation layer the dust just drifts. */
        q.hop += q.hopSp * dt;
        const lift = q.salt ? Math.abs(Math.sin(q.hop)) * (14 + q.d * 26) : 0;
        const drift = Math.sin(t * 0.7 + q.ph) * 16;
        q.x -= (q.sp * (0.55 + w.strength * 0.7)) * dt;
        q.y += (drift - lift * 0.9) * dt;
        if (q.salt) q.y = clamp(q.y, H * 0.6, H * 1.0);
        if (q.x < -80) {
          const next = this.spawn(q.pl, false);
          next.x = W + rand(0, 140);
          Object.assign(q, next);
        }

      } else {
        /* the swell moves the glints sideways and rocks them a little; the
           wind ruffles the surface, so a gust speeds the whole band up */
        q.x += (q.sp * (0.6 + w.strength * 0.9) + Math.sin(t * 0.5 + q.ph) * 6) * dt;
        q.y += Math.sin(t * 0.9 + q.ph * 1.7) * 3 * dt;
        if (q.x > W + 12) { q.x = -12; q.y = rand(H * 0.42, H * 0.98); }
      }
    }

    if (kind === "rain") {
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const s = this.drops[i];
        s.life -= dt * 3.4;
        if (s.life <= 0) this.drops.splice(i, 1);
      }
      /* Lightning as a flicker, not a flash. A real strike is two or three
         strokes over about a fifth of a second, so the decay is interrupted
         rather than smooth, and it is brighter at the top of the frame
         because that is where the sky is. */
      this.flash *= 0.82;
      if (this.strokes > 0 && Math.random() < 0.22) {
        this.flash = rand(0.28, 0.6);
        this.strokes--;
      }
      if (this.strokes <= 0 && Math.random() < 0.0011 + energy * 0.0022) {
        this.strokes = Math.round(rand(2, 4));
        this.boltAt = rand(0.15, 0.85);
        /* built here, once per strike, rather than on every frame of the
           flicker: a strike lasts a fifth of a second and the gradient
           does not change within it */
        this.bolt = this.ctx.createRadialGradient(
          W * this.boltAt, -H * 0.15, 0, W * this.boltAt, -H * 0.15, H * 1.3);
        this.bolt.addColorStop(0, "rgba(226,242,232,0.85)");
        this.bolt.addColorStop(0.45, "rgba(206,230,220,0.3)");
        this.bolt.addColorStop(1, "rgba(200,225,215,0)");
      }
    }

    if (kind === "sand") {
      for (const v of this.veils) {
        v.x -= v.sp * (0.5 + this.wind.strength * 0.8) * dt;
        if (v.x + v.w < -40) { v.x = W + rand(20, 200); v.y = H * rand(0.44, 0.9); }
      }
    }
  }

  draw(a, t) {
    if (a <= 0.01) return;
    const { ctx, W, H, kind } = this;
    ctx.save();

    if (kind === "snow") {
      /* one sprite per plane, one alpha set per plane */
      for (let i = 0; i < PLANES.length; i++) {
        const sprite = this.sprites[i];
        if (!sprite) continue;
        ctx.globalAlpha = a * PLANES[i].alpha * 0.9;
        const half = sprite.width / 2;
        for (const q of this.p) {
          if (q.pl !== i) continue;
          ctx.drawImage(sprite, q.x - half, q.y - half);
        }
      }

    } else if (kind === "rain") {
      if (this.flash > 0.01 && this.bolt) {
        /* brighter at the top, and off to one side, so it reads as a strike
           somewhere rather than as the page blinking */
        ctx.globalAlpha = a * this.flash;
        ctx.fillStyle = this.bolt; ctx.fillRect(0, 0, W, H);
      }
      ctx.strokeStyle = "#CFE9DA"; ctx.lineCap = "round";
      for (let i = 0; i < PLANES.length; i++) {
        const pl = PLANES[i];
        ctx.globalAlpha = a * pl.alpha * 0.42;
        ctx.lineWidth = clamp(pl.depth * 1.6, 0.6, 1.7);
        const path = new Path2D();
        for (const q of this.p) {
          if (q.pl !== i) continue;
          /* the streak IS the motion blur: it trails behind the drop along
             the drop's own velocity, and its length is that velocity */
          const k = 0.026 + pl.depth * 0.012;
          path.moveTo(q.x, q.y);
          path.lineTo(q.x - q.vx * k, q.y - q.vy * k);
        }
        ctx.stroke(path);
      }
      /* where it lands */
      if (this.drops.length) {
        ctx.strokeStyle = "#DCEFE4"; ctx.lineWidth = 1;
        for (const s of this.drops) {
          const grow = 1 - s.life;
          ctx.globalAlpha = a * s.life * 0.5;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.r + grow * 9, (s.r + grow * 9) * 0.32, 0, Math.PI, 0);
          ctx.stroke();
        }
      }

    } else if (kind === "sand") {
      /* the veils go down first: everything else is blowing through them */
      if (this.veil) {
        for (const v of this.veils) {
          ctx.globalAlpha = a * v.a * (0.6 + this.wind.strength * 0.5);
          ctx.drawImage(this.veil, v.x, v.y, v.w, v.h);
        }
      }
      ctx.strokeStyle = "#F0CE94"; ctx.lineCap = "round";
      for (let i = 0; i < PLANES.length; i++) {
        const pl = PLANES[i];
        const path = new Path2D();
        let any = false;
        for (const q of this.p) {
          if (q.pl !== i) continue;
          any = true;
          /* a saltating grain is a short hard dash; airborne dust is a
             long soft one */
          const len = (q.salt ? 10 + q.d * 26 : 22 + q.d * 44) * (0.7 + this.wind.strength * 0.5);
          path.moveTo(q.x, q.y);
          path.lineTo(q.x + len, q.y + q.rise * q.d);
        }
        if (!any) continue;
        ctx.globalAlpha = a * pl.alpha * 0.3;
        ctx.lineWidth = clamp(pl.depth * 1.7, 0.6, 1.9);
        ctx.stroke(path);
      }
      /* the ground haze the dunes sit in, built once at resize */
      if (this.haze) { ctx.globalAlpha = a; ctx.fillStyle = this.haze; ctx.fillRect(0, H * 0.4, W, H * 0.6); }

    } else {
      ctx.strokeStyle = "#E4FBF7"; ctx.lineCap = "butt";
      for (let i = 0; i < PLANES.length; i++) {
        const pl = PLANES[i];
        const path = new Path2D();
        let any = false;
        for (const q of this.p) {
          if (q.pl !== i) continue;
          /* the wink: nothing is drawn at all while the facet is turned away */
          const tw = Math.sin(t * q.tw + q.ph);
          if (tw <= 0.12) continue;
          const len = q.len * tw;
          any = true;
          path.moveTo(q.x - len / 2, q.y);
          path.lineTo(q.x + len / 2, q.y);
        }
        if (!any) continue;
        ctx.globalAlpha = a * pl.alpha * 0.34;
        ctx.lineWidth = clamp(pl.depth * 1.5, 0.6, 1.6);
        ctx.stroke(path);
      }
    }
    ctx.restore();
  }
}

/**
 * @param refs   nodes the engine paints: host, backdrop, grade, canvas,
 *               instrument, progress, and the four gauge elements.
 * @param liveRef a ref holding { city, temp, destTemps } so refreshed
 *               weather reaches the gauges without restarting the engine.
 */
export function useSeasonBackdrop(refs, liveRef) {
  useEffect(() => {
    const host = refs.host.current;
    const backdrop = refs.backdrop.current;
    const grade = refs.grade.current;
    const canvas = refs.canvas.current;
    if (!host || !backdrop || !grade || !canvas) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* These clip ids are Mixkit's own "Full HD" download, which turned out
       to be a near-raw master rather than a web-encoded stream: the closing
       sunrise clip alone is 76MB for 23 seconds, about 26 Mbps. That is what
       "the last video is lagging" actually was — decoding, and repeatedly
       re-buffering, a file that size on top of the weather canvas and
       everything else on screen drops frames on anything short of a wired
       desktop. The 720p tier of the same clip is 7MB, roughly a tenth of
       the size, and reads the same once it sits under the scene's own
       colour tint, so both mobile and desktop get it now — there was no
       visual case for 1080 here, only a performance cost. */
    const q = "720";
    const mk = (id, tier) => `https://assets.mixkit.co/videos/${id}/${id}-${tier || q}.mp4`;

    /* ---- build the layer stack ---- */
    backdrop.textContent = "";
    const layers = {};
    Object.entries(SCENES).forEach(([key, cfg]) => {
      const el = document.createElement("div");
      el.className = "layer";
      /* the colour of the place, under whatever is still loading */
      if (cfg.base) el.style.background = cfg.base;

      let video = null;
      if (cfg.image) {
        const img = document.createElement("img");
        img.src = UNSPLASH(cfg.image);
        img.alt = ""; img.decoding = "async";
        img.className = "layer-still";
        /* blocked or offline: drop the node so the broken-image glyph
           never shows, and let the gradient carry the scene */
        img.addEventListener("error", () => img.remove(), { once: true });
        el.appendChild(img);
      } else if (cfg.video) {
        video = document.createElement("video");
        video.muted = true; video.loop = true; video.playsInline = true; video.preload = "none";
        video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
        if (cfg.plate) video.poster = cfg.plate;
        video.dataset.id = cfg.video;
        el.appendChild(video);
      } else if (cfg.plate) {
        /* neither a clip nor an Unsplash still — the generated plate
           stands on its own as the scene's picture instead of nothing */
        const img = document.createElement("img");
        img.src = cfg.plate; img.alt = ""; img.decoding = "async";
        img.className = "layer-still";
        el.appendChild(img);
      }

      backdrop.appendChild(el);
      layers[key] = { el, video, cfg, playing: false };
    });

    /* A request can just fail — live testing turned up the opening scene's
       own clip coming back as a flat format error under load — so each
       video steps down through a small chain of tiers on error instead of
       being left dead, the same defence the trip pages already have. */
    function loadVideo(video) {
      if (!video || video.src || !video.dataset.id) return;
      const id = video.dataset.id;
      const chain = ["720", "1080", "360"];
      let step = 0;
      video.preload = "auto";
      video.src = mk(id, chain[step]);
      video.addEventListener("error", function retry() {
        step++;
        if (step < chain.length) {
          video.src = mk(id, chain[step]);
          video.play().catch(() => {});
        } else {
          video.removeEventListener("error", retry);
        }
      });
      video.play().catch(() => {});
    }

    const ACC = Object.fromEntries(
      Object.entries(SCENES).map(([k, s]) => [k, [hex2rgb(s.acc[0]), hex2rgb(s.acc[1])]])
    );

    const scenes = [...host.querySelectorAll(".scene")].map((el) => ({ el, key: el.dataset.key, w: 0 }));
    if (!scenes.length) return;

    const weights = {};
    Object.keys(SCENES).forEach((k) => (weights[k] = 0));
    const mix = { alt: 53, temp: 29, acc: [255, 181, 36], acc2: [201, 122, 8], energy: 0, lead: "night" };
    const shown = { alt: 53, temp: 29, dist: 0 };
    let lastY = scrollY;

    function measure() {
      const vh = innerHeight, centre = scrollY + vh * 0.5;
      let total = 0, lead = scenes[0], leadW = -1;

      scenes.forEach((s) => {
        const u = (centre - s.el.offsetTop) / s.el.offsetHeight;
        const w = smooth((u + 0.28) / 0.42) * smooth((1.28 - u) / 0.42);
        s.w = w; total += w;
        if (w > leadW) { leadW = w; lead = s; }
      });
      if (total <= 0) { scenes[0].w = 1; total = 1; }

      Object.keys(weights).forEach((k) => (weights[k] = 0));
      scenes.forEach((s) => { weights[s.key] = (weights[s.key] || 0) + s.w / total; });

      const live = liveRef.current || {};
      let alt = 0, temp = 0, tint = [0, 0, 0, 0];
      const acc = [0, 0, 0], acc2 = [0, 0, 0];

      Object.entries(weights).forEach(([k, w]) => {
        const L = layers[k];
        if (!L) return;
        L.el.style.opacity = w.toFixed(3);

        if (!reduced && L.video) {
          /* a clip is only fetched once its scene is actually approaching */
          if (w > 0.015 && !L.video.src) loadVideo(L.video);
          if (w > 0.02 && !L.playing && L.video.src) {
            L.video.play().catch(() => {}); L.playing = true;
          } else if (w <= 0.02 && L.playing) {
            L.video.pause(); L.playing = false;
          }
        }

        const cfg = SCENES[k];
        alt += cfg.alt * w;
        const reading = cfg.place ? live.destTemps?.[cfg.place] : live.temp;
        temp += (typeof reading === "number" ? reading : cfg.temp) * w;
        for (let i = 0; i < 3; i++) { acc[i] += ACC[k][0][i] * w; acc2[i] += ACC[k][1][i] * w; }
        for (let i = 0; i < 4; i++) tint[i] += cfg.tint[i] * w;
      });

      grade.style.background =
        `linear-gradient(180deg,` +
        ` rgba(${tint[0] | 0},${tint[1] | 0},${tint[2] | 0},${(tint[3] * 1.25).toFixed(3)}) 0%,` +
        ` rgba(${tint[0] | 0},${tint[1] | 0},${tint[2] | 0},${(tint[3] * 0.35).toFixed(3)}) 42%,` +
        ` rgba(10,11,16,${(0.55 + tint[3] * 0.4).toFixed(3)}) 100%)`;

      mix.alt = alt; mix.temp = temp; mix.lead = lead.key;

      host.style.setProperty("--acc-1", `rgb(${acc[0] | 0},${acc[1] | 0},${acc[2] | 0})`);
      host.style.setProperty("--acc-2", `rgb(${acc2[0] | 0},${acc2[1] | 0},${acc2[2] | 0})`);

      /* How much of the hero photography to show. It is driven from the
         opening scene's own weight, which is the same measurement the
         gauges and the crossfades use, rather than from a separate scroll
         binding: that binding silently stuck at full opacity and left an
         opaque layer over every video on the page. The CSS default is 0,
         so if this loop never runs the photography stays hidden and the
         journey is still there. Failing invisible beats failing opaque. */
      host.style.setProperty("--hero-on", clamp(weights.night * 1.25, 0, 1).toFixed(3));

      const doc = document.documentElement.scrollHeight - vh;
      if (refs.progress.current) refs.progress.current.style.width = (clamp(scrollY / doc, 0, 1) * 100).toFixed(2) + "%";
      refs.instrument.current?.classList.toggle("is-on", scrollY > vh * 0.45);

      mix.energy = clamp(Math.abs(scrollY - lastY) / 45, 0, 1);
      lastY = scrollY;
    }

    function paintGauges() {
      const live = liveRef.current || {};
      shown.alt = lerp(shown.alt, mix.alt, 0.12);
      shown.temp = lerp(shown.temp, mix.temp, 0.12);

      const place = SCENES[mix.lead].place;
      const isLive = place ? typeof live.destTemps?.[place] === "number" : typeof live.temp === "number";
      const where = place ? DESTS[place].label : live.city || "you";

      const { alt, temp, tempLabel, terrain, dist, distLabel } = refs.gauges;
      if (alt.current) alt.current.textContent = fmt(shown.alt) + " m";
      if (temp.current) {
        temp.current.textContent = Math.round(shown.temp) + "°C";
        temp.current.classList.toggle("is-live", isLive);
      }
      if (tempLabel.current) {
        const label = (isLive ? "Live · " : "Average · ") + where;
        if (tempLabel.current.textContent !== label) tempLabel.current.textContent = label;
      }
      if (terrain.current) {
        const label = mix.lead === "night" && live.city ? live.city : TERRAIN_LABEL[mix.lead];
        if (terrain.current.textContent !== label) terrain.current.textContent = label;
      }
      /* distance only means something once we know where the reader is */
      if (dist.current && distLabel.current) {
        if (place && typeof live.lat === "number") {
          const km = haversine(live.lat, live.lon, DESTS[place].lat, DESTS[place].lon);
          shown.dist = lerp(shown.dist, km, 0.1);
          dist.current.textContent = fmt(shown.dist) + " km";
          distLabel.current.textContent = "From " + (live.city || "you");
        } else {
          dist.current.textContent = place ? DESTS[place].label : "—";
          distLabel.current.textContent = place ? "Heading for" : "Distance";
        }
      }
    }

    /* ---- particles ---- */
    const ctx = canvas.getContext("2d");
    /* one wind for the whole page, so the three fields agree with each other */
    const wind = new Wind();
    const fields = ["snow", "rain", "sand", "sea"].map((k) => new Field(k, ctx, wind));
    let W = 0, H = 0;

    function size() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const changed = W !== innerWidth;
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (changed || !fields[0].p.length) fields.forEach((f) => f.resize(W, H));
    }

    /* ---- the loop ---- */
    let raf = 0, last = performance.now(), visible = true;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      measure();
      paintGauges();

      if (!reduced && visible) {
        /* stepped once per frame, not once per field: the whole point is
           that all three fields are reading the same air */
        wind.step(dt, t, mix.energy);
        ctx.clearRect(0, 0, W, H);
        for (const f of fields) {
          let a = 0;
          for (const [key, w] of Object.entries(weights)) if (SCENES[key].field === f.kind) a += w;
          if (a > 0.01) { f.step(dt, mix.energy, t); f.draw(a, t); }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => { visible = !document.hidden; last = performance.now(); };
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("resize", size, { passive: true });

    size();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("resize", size);
      Object.values(layers).forEach((L) => {
        if (!L.video) return;
        L.video.pause();
        L.video.removeAttribute("src");
        L.video.load();
      });
      backdrop.textContent = "";
    };
  }, [refs, liveRef]);
}
