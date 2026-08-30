import Link from "next/link";
import TripIndex from "@/components/TripIndex";
import SiteFooter from "@/components/SiteFooter";
import { getTrips, getSite } from "@/lib/db";
import { buildCards, buildDepartures } from "@/lib/cards";

const PACKAGES_TITLE = "All trips — fixed departures from Gujarat";
const PACKAGES_DESC =
  "Every Ghumakkaad departure: monsoon camps at Saputara, the Thar desert, and Himachal by train. Real dates, fixed groups, prices per person.";

export const metadata = {
  title: PACKAGES_TITLE,
  description: PACKAGES_DESC,
  alternates: { canonical: "/packages" },
  openGraph: { type: "website", url: "/packages", title: PACKAGES_TITLE, description: PACKAGES_DESC },
  twitter: { card: "summary_large_image", title: PACKAGES_TITLE, description: PACKAGES_DESC },
};

export const revalidate = 300;

export default async function Packages({ searchParams }) {
  const [trips, site] = await Promise.all([getTrips(), getSite()]);
  const initialTerrain = typeof searchParams?.terrain === "string" ? searchParams.terrain : null;
  const cards = buildCards(trips);
  const departures = buildDepartures(trips);

  /* departures grouped by month, because a flat list of a dozen rows
     with a hairline under each one is the hardest version to scan */
  const months = [];
  departures.forEach((d) => {
    const last = months[months.length - 1];
    if (last && last.month === d.month) last.rows.push(d);
    else months.push({ month: d.month, rows: [d] });
  });

  return (
    <>
      <div className="headwrap">
        <div className="topbar">
          <Link className="tb" href="/" aria-label="Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>
          </Link>
          <nav className="crumb" aria-label="Breadcrumb"><Link href="/">Home</Link> / <b>Trips</b></nav>
        </div>
      </div>

      <main className="index-page">
        <section className="index-wrap">
          <TripIndex cards={cards} whatsapp={site.whatsapp} initialTerrain={initialTerrain} />
        </section>

        {months.length > 0 && (
          <section className="depart-wrap">
            <div className="index-wrap">
              <p className="kicker">Next departures</p>
              <h2>Dates that do not move.</h2>
              <div className="months">
                {months.map((m) => (
                  <div className="month" key={m.month}>
                    <h3>{m.month}</h3>
                    <ul>
                      {m.rows.map((d) => (
                        <li key={d.key}>
                          <Link href={d.href}>
                            <b>{d.dateLabel}</b>
                            <span>{d.name}</span>
                            <i>{d.days}</i>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
