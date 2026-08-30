import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { getSite } from "@/lib/db";

const TITLE = "Terms & Conditions";
const DESC = "The terms that apply when you book a trip with Ghumakkaad.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/terms" },
  openGraph: { type: "website", url: "/terms", title: TITLE, description: DESC },
};

export const revalidate = 300;

export default async function Terms() {
  const site = await getSite();
  const updated = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="headwrap">
        <div className="topbar">
          <Link className="tb" href="/" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>
          </Link>
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> / <b>Terms</b></nav>
        </div>
      </div>

      <main className="index-page">
        <section className="panel">
          <div className="panel-in" style={{ maxWidth: 760 }}>
            <p className="kicker">Legal</p>
            <h1>Terms &amp; Conditions</h1>
            <p className="lede">Last updated {updated}.</p>

            <div className="legal-copy">
              <p>
                These terms apply when you book a trip with {site.name}, {site.address}. By
                confirming a booking with us — over WhatsApp, by phone, or by email — you're
                agreeing to them.
              </p>

              <h2>Bookings</h2>
              <p>
                Every trip on this site runs on the fixed dates shown on its own page, at the
                per-person price shown there. Prices and dates are accurate at the time you
                see them but aren't guaranteed until we confirm your booking and receive the
                payment we ask for at that time. A seat is held for you once we confirm it, not
                before.
              </p>

              <h2>What's included</h2>
              <p>
                Each trip page lists exactly what's included and what isn't under "What you
                get", along with pickup points, packing notes and answers to common questions.
                That page is the source of truth for that specific trip, not this one.
              </p>

              <h2>Changes we may need to make</h2>
              <p>
                Weather, road conditions, local restrictions or safety can require us to
                adjust an itinerary, substitute a stop, or change timings after departure. We
                make these calls to keep the group safe and will always tell you what's
                changed and why. If we have to cancel a departure outright — most often for
                too few travellers to run it safely, or conditions beyond our control — we'll
                offer you a full refund or a seat on another date; see our{" "}
                <Link href="/refund-policy">Cancellations &amp; refunds</Link> page.
              </p>

              <h2>Your responsibilities</h2>
              <p>
                You're responsible for arriving at the pickup point on time with valid photo
                ID, for your own conduct and belongings, and for telling us about any medical
                condition that could affect the trip before you book. Group trips only work
                when everyone follows the trip leader's instructions and the group's schedule
                — please travel accordingly. We'd strongly recommend personal travel
                insurance; we don't provide it as part of the package unless a trip page says
                otherwise.
              </p>

              <h2>If you need to cancel</h2>
              <p>
                Cancellation charges are specific to each trip and shown on that trip's own
                page under "If you cancel", along with our general{" "}
                <Link href="/refund-policy">Cancellations &amp; refunds</Link> policy.
              </p>

              <h2>Liability</h2>
              <p>
                We arrange transport, stays and activities through third-party operators and
                take reasonable care in choosing them, but we aren't liable for loss, delay,
                illness or injury caused by circumstances outside our reasonable control —
                including weather, natural events, government action, or the acts of a
                transport or accommodation provider.
              </p>

              <h2>Governing law</h2>
              <p>
                These terms are governed by the laws of India, and any dispute is subject to
                the courts of Ahmedabad, Gujarat.
              </p>

              <h2>Contact</h2>
              <p>
                {site.email} · {site.phoneDisplay}
              </p>

              <p className="note">
                This is a general-purpose starting point covering the situations a fixed-
                departure group trip business normally needs to address, written from how
                this site and its booking flow actually work. It hasn't been reviewed by a
                lawyer — have it checked, and add anything specific to how you actually take
                payment and confirm bookings, before treating it as final.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
