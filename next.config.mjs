/* Security headers.
   frame-ancestors on /admin stops the trip desk from being framed by
   another site (clickjacking). The rest apply everywhere: they cost
   nothing, break nothing this site does, and are what Lighthouse's
   "Best Practices" audit checks for.

   The Content-Security-Policy is deliberately not locked down to a
   strict script-src / nonce setup: this site's own JSON-LD blocks and
   several inline styles set by the scroll engine (useJourney.js,
   useSeasonBackdrop.js) run as inline script/style, and it hotlinks
   photography and video from Unsplash, Wikimedia and Mixkit and calls
   ipwho.is / open-meteo.com for the live weather gauges. A strict CSP
   would need a nonce threaded through every one of those before it
   could ship without breaking the page, which is a larger change than
   "add headers" — so this is the safe subset: it still stops the page
   being embedded in a foreign iframe, still stops it loading a script
   from a host that isn't explicitly listed, and still blocks Flash/
   plugin content outright, all without touching how the page renders. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "img-src 'self' data: https://images.unsplash.com https://upload.wikimedia.org",
      "media-src 'self' https://assets.mixkit.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipwho.is https://api.open-meteo.com https://www.google-analytics.com https://*.google-analytics.com",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "assets.mixkit.co" }
    ]
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/admin", headers: [{ key: "X-Frame-Options", value: "DENY" }] },
    ];
  },
};
export default nextConfig;
