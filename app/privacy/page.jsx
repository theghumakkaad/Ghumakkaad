import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { getSite } from "@/lib/db";

const TITLE = "Privacy Policy";
const DESC = "How Ghumakkaad collects, uses and stores information about you.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/privacy" },
  openGraph: { type: "website", url: "/privacy", title: TITLE, description: DESC },
};

export const revalidate = 300;

export default async function PrivacyPolicy() {
  const site = await getSite();
  const updated = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="headwrap">
        <div className="topbar">
          <Link className="tb" href="/" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>
          </Link>
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> / <b>Privacy</b></nav>
        </div>
      </div>

      <main className="index-page">
        <section className="panel">
          <div className="panel-in" style={{ maxWidth: 760 }}>
            <p className="kicker">Legal</p>
            <h1>Privacy Policy</h1>
            <p className="lede">Last updated {updated}.</p>

            <div className="legal-copy">
              <p>
                {site.name} ("we", "us") runs fixed-departure group trips out of Gujarat. This
                page explains what information we collect when you visit this website or get
                in touch about a trip, and what we do with it.
              </p>

              <h2>What we collect directly</h2>
              <p>
                We only receive personal details — your name, phone number, email address,
                and the trip and dates you're interested in — when you send them to us
                yourself: by messaging us on WhatsApp, calling {site.phoneDisplay}, or emailing{" "}
                {site.email}. We use this only to plan and confirm your trip, and we do not
                sell or rent it to anyone else.
              </p>
              <p>
                Conversations on WhatsApp are stored by WhatsApp/Meta under their own privacy
                policy, not on our servers. We keep whatever record of a booking (name, trip,
                dates, amount) is needed to run that departure and to meet our own accounting
                obligations.
              </p>

              <h2>What this website collects automatically</h2>
              <p>
                The home page shows a live elevation/weather readout as you scroll. To do
                that, your browser asks two third-party services — <code>ipwho.is</code>{" "}
                (an approximate location from your IP address) and{" "}
                <code>api.open-meteo.com</code> (current weather for that location) — for a
                reading. Neither call is stored by us; if either service is blocked, offline,
                or slow, the page just falls back to a seasonal average and nothing breaks.
              </p>
              <p>
                We use <code>sessionStorage</code> in your browser to remember that you've
                already seen the opening animation, so it doesn't replay every time you move
                between pages in the same visit. This is not a cookie, isn't shared with
                anyone, and clears itself when you close the tab.
              </p>
              <p>
                If we've turned on Google Analytics, it records anonymised usage information —
                which pages you visit and whether you clicked a WhatsApp, call, or email
                button — to help us understand which trips people are interested in. It does
                not receive your name, phone number or email from this site. See{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
                  Google's own privacy policy
                </a>{" "}
                for how Analytics handles that data.
              </p>

              <h2>Photography and video credits</h2>
              <p>
                Some trip photographs on this site are sourced from Unsplash and Wikimedia
                Commons, and some background footage from Mixkit, under each service's own
                licence terms. These are used for illustration only and involve no personal
                data of yours.
              </p>

              <h2>Your choices</h2>
              <p>
                You can ask us what information we hold about you, ask us to correct it, or
                ask us to delete it, by emailing {site.email}. We'll respond within a
                reasonable time. If you'd rather not have your IP looked up for the weather
                gauge, browsing with location/tracking protection turned on in your browser
                will simply show you the seasonal average instead — the page still works
                normally.
              </p>

              <h2>Changes to this policy</h2>
              <p>
                We may update this page as the site or our tools change. The date at the top
                always reflects the latest version.
              </p>

              <h2>Contact</h2>
              <p>
                {site.name}, {site.address}
                <br />
                {site.email} · {site.phoneDisplay}
              </p>

              <p className="note">
                This page is a plain-language starting point, written from what this website
                actually does. It hasn't been reviewed by a lawyer — if you're relying on it
                to meet a specific legal obligation (for example under India's Digital
                Personal Data Protection Act), have it checked before you treat it as final.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
