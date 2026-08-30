import Script from "next/script";
import { site } from "@/lib/trips";

/* Fonts are self-hosted from npm rather than fetched from
   fonts.googleapis.com. Two reasons: the stylesheet link was
   render-blocking on every page, and the woff2 files now ship from
   our own origin so there is no third-party round trip before the
   display face paints. Each file carries a unicode-range, so an
   English page only downloads the latin subset. */
import "@fontsource/alfa-slab-one/latin-400.css";
import "@fontsource-variable/baloo-2/wght.css";
import "@fontsource/dm-mono/latin-400.css";
import "@fontsource/dm-mono/latin-500.css";

import "./globals.css";

export const metadata = {
  metadataBase: new URL(site.url || "https://ghumakkaad.com"),
  title: {
    default: `${site.name} — fixed departure group trips from Gujarat`,
    template: `%s | ${site.name}`,
  },
  description: site.blurb,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    title: `${site.name} — fixed departure group trips from Gujarat`,
    description: site.blurb,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  /* Search Console ownership. Set NEXT_PUBLIC_GSC_VERIFICATION to the
     content value Google gives you under Search Console → Settings →
     Ownership verification → HTML tag, and this prints it as the meta
     tag Google is looking for — no file upload needed. Empty by
     default, so nothing renders until it's set. */
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

export const viewport = {
  themeColor: "#0A0A0C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* The agency itself, stated once for the whole site. */
function OrganisationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": (site.url || "https://ghumakkaad.com") + "/#organization",
    name: site.name,
    description: site.blurb,
    url: site.url || "https://ghumakkaad.com",
    logo: (site.url || "https://ghumakkaad.com") + "/icon.png",
    image: (site.url || "https://ghumakkaad.com") + "/opengraph-image.png",
    telephone: "+" + site.whatsapp,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/* Google Analytics 4. NEXT_PUBLIC_GA_ID is blank until you paste in a
   real Measurement ID (looks like G-XXXXXXXXXX, from
   analytics.google.com → Admin → Data Streams → your site), so nothing
   loads, no request fires, and no cookie is set until you turn it on. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://assets.mixkit.co" crossOrigin="" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        {/* the opening splash and the masthead both draw this file the
            instant the page paints, so it is worth a hint rather than
            waiting for the browser to discover it in markup */}
        <link rel="preload" href="/logo.png" as="image" />
        <OrganisationSchema />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
