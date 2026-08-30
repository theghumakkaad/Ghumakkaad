import Link from "next/link";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { getTrips, getSite } from "@/lib/db";
import { TERRAINS } from "@/lib/cards";
import ContactLinks from "./ContactLinks";
import FooterCta from "./FooterCta";

/* The footer on /packages and the trip pages. It used to be three
   lines of text with every trip name run together by middle dots,
   which read as an afterthought next to the landing page's colophon.
   Same three columns as the colophon now, in the page's own palette. */
export default async function SiteFooter() {
  const [trips, site] = await Promise.all([getTrips(), getSite()]);
  const year = new Date().getFullYear();

  return (
    <footer className="sitefoot">
      <FooterCta whatsapp={site.whatsapp} />
      <div className="sitefoot-grid">
        <div className="sf-brand">
          <img src="/logo.png" alt="" className="sf-mark" width="40" height="40" decoding="async" />
          <b>{site.name}</b>
          <p>{site.blurb}</p>
          <address>{site.address}</address>
          <ul>
            <ContactLinks whatsapp={site.whatsapp} phoneDisplay={site.phoneDisplay} email={site.email} instagram={site.instagram} location="sitefoot" />
          </ul>
        </div>

        <div>
          <h2>Where to</h2>
          <ul>
            {TERRAINS.map((t) => (
              <li key={t.key}>
                {/* footer links repeat on every page; letting Next prefetch
                    all four filter variants plus every trip page below on
                    scroll-into-view was pure mobile-data cost for links that
                    mostly go unclicked in a given visit */}
                <Link href={`/packages?terrain=${t.key}`} prefetch={false}>{t.label}</Link>
              </li>
            ))}
            <li><Link href="/packages" prefetch={false}>All departures</Link></li>
          </ul>
        </div>

        <div>
          <h2>Every trip we run</h2>
          <ul>
            {trips.map((t) => (
              <li key={t.slug}>
                <Link href={`/packages/${t.slug}`}>{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="sitefoot-legal">
        <span>© {year} {site.name}</span>
        <span style={{ display: "flex", gap: 14 }}>
          <Link href="/privacy" prefetch={false}>Privacy</Link>
          <Link href="/terms" prefetch={false}>Terms</Link>
          <Link href="/refund-policy" prefetch={false}>Cancellations &amp; refunds</Link>
        </span>
        <span>{site.tagline}</span>
        <a href="#" className="sf-top">
          <ArrowUp size={11} weight="bold" aria-hidden="true" />Back to top
        </a>
      </div>
    </footer>
  );
}
