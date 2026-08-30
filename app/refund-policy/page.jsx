import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import { getSite } from "@/lib/db";

const TITLE = "Cancellations & Refunds";
const DESC = "How cancellations, date changes and refunds work on a Ghumakkaad trip.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/refund-policy" },
  openGraph: { type: "website", url: "/refund-policy", title: TITLE, description: DESC },
};

export const revalidate = 300;

export default async function RefundPolicy() {
  const site = await getSite();
  const updated = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="headwrap">
        <div className="topbar">
          <Link className="tb" href="/" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>
          </Link>
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> / <b>Cancellations &amp; refunds</b></nav>
        </div>
      </div>

      <main className="index-page">
        <section className="panel">
          <div className="panel-in" style={{ maxWidth: 760 }}>
            <p className="kicker">Legal</p>
            <h1>Cancellations &amp; Refunds</h1>
            <p className="lede">Last updated {updated}.</p>

            <div className="legal-copy">
              <p>
                The exact cancellation charges for a trip — what you're charged depending on
                how close to departure you cancel — are specific to that trip and shown on its
                own page, under "If you cancel". This page covers the general rules that sit
                around that.
              </p>

              <h2>If you cancel</h2>
              <p>
                Send us a cancellation request over WhatsApp or email with your name and the
                trip and date you booked. The charge that applies is whatever's listed on that
                trip's own cancellation table for how far out you are from departure. Any
                refund due is processed back to your original payment method, typically within
                7–10 business days of us confirming the cancellation.
              </p>

              <h2>If we cancel</h2>
              <p>
                We occasionally have to cancel a departure ourselves — most often because too
                few people booked to run it safely or affordably, or because of weather,
                safety or government restrictions beyond our control. When that happens you
                get a full refund of what you've paid us, or the option to move to another
                departure date instead, whichever you'd prefer.
              </p>

              <h2>Changing your date instead of cancelling</h2>
              <p>
                If you'd rather move to a different departure of the same trip than cancel
                outright, ask us — we'll move you across if there's a seat, subject to any
                price difference between the two dates. Requests made close to departure may
                not always be possible, since seats and vehicles are booked ahead for a fixed
                group size.
              </p>

              <h2>No-shows</h2>
              <p>
                If you don't show up at the pickup point on departure day without having
                cancelled beforehand, that's treated as a cancellation with no advance notice,
                which on most trips means no refund — the seat, vehicle and stay were already
                committed on your behalf.
              </p>

              <h2>Questions</h2>
              <p>
                If anything here doesn't match what you were told when you booked, what you
                were told at booking is what applies — message us on WhatsApp or email{" "}
                {site.email} and we'll sort it out directly.
              </p>

              <p className="note">
                The refund timeline above (7–10 business days) is a reasonable industry default
                — replace it with your actual payment processor's timeline if it differs. This
                page hasn't been reviewed by a lawyer; have it checked before treating it as
                final.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
