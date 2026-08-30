import Link from "next/link";
import { getTrips } from "@/lib/db";

/* A wrong turn should still offer somewhere to go, so this lists the
   real trips instead of leaving a single Home button on a black page. */
export default async function NotFound() {
  const trips = await getTrips();

  return (
    <main className="lost">
      <div className="lost-in">
        <p className="kicker">404</p>
        <h1>Wrong turn.</h1>
        <p className="lede">
          That page is not on the route. Here is everything we do run.
        </p>

        <ul className="lost-list">
          {trips.map((t) => (
            <li key={t.slug}>
              <Link href={`/packages/${t.slug}`}>
                <b>{t.name}</b>
                <span>{t.duration}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="lost-actions">
          <Link className="cta" href="/packages">All trips</Link>
          <Link className="lost-home" href="/">Back to the start</Link>
        </div>
      </div>
    </main>
  );
}
