"use client";
import { useJourney } from "./useJourney";
import Backdrop from "./Backdrop";
import TopBar from "./TopBar";
import DayTrack from "./DayTrack";
import PriceBar from "./PriceBar";
import Departures from "./Departures";
import { sanitizeHtml } from "@/lib/sanitize";
import { wikimediaFilePage } from "@/lib/images";

export default function TripPage({ trip, whatsapp }) {
  useJourney(trip.scenes);
  /* Wikimedia photographs are CC BY-SA and need a visible credit —
     README.md flagged this as unresolved. Unsplash's licence has no
     such requirement, so this only ever shows up on the two trips
     currently using a Wikimedia source. */
  const creditUrl = wikimediaFilePage(trip.cardImage);

  return (
    <div data-terrain={trip.terrain}>
      <Backdrop />

      <div className="headwrap">
        <TopBar crumb={trip.name} />
        <DayTrack days={trip.days} />
      </div>

      <main>
        <header className="hero">
          <p className="kicker">{trip.kicker}</p>
          <h1 id="heroTitle">{trip.name}</h1>
          <p className="sub">{trip.sub}</p>
          <div className="facts">
            {(trip.facts || []).map((f, i) => (
              <span className="fact" key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(f) }} />
            ))}
          </div>
          {creditUrl && (
            <p className="note" style={{ marginTop: "1rem" }}>
              Photo: <a href={creditUrl} rel="noopener" target="_blank">Wikimedia Commons</a>, CC BY-SA
            </p>
          )}
        </header>

        {trip.days.map((d, i) => (
          <section className="day" id={"d" + i} key={i}
            /* Pin dwell time is tuned down from the original 260-300vh —
                the ui-ux-pro-max motion catalog flags long pin chains as
                fighting native scroll feel, especially on mobile. Still
                enough height for the itinerary reel to play through. */
            style={{ height: (d.acts.length > 6 ? 240 : 200) + "vh" }}>
            <div className="day-stage">
              <div className="day-in">
                <p className="day-tag pre">{d.tag}</p>
                <h2>{d.title}</h2>
                <div className="acts-window">
                  <ul className="acts">
                    {d.acts.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                </div>
                {d.meals && <span className="meals pre">{d.meals}</span>}
              </div>
            </div>
          </section>
        ))}

        {/* straight from the departure_dates table, so a date added in the
            admin shows up here without anyone touching this file */}
        <Departures trip={trip} whatsapp={whatsapp} />

        <section className="panel">
          <div className="panel-in">
            <h2 className="pre">What you get</h2>
            <div className="two" style={{ marginTop: "1.6rem" }}>
              <div className="sheet pre">
                <p className="kicker">Included</p>
                <ul className="tick inc">
                  {trip.included.map((x, i) => <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(x) }} />)}
                </ul>
              </div>
              <div className="sheet pre">
                <p className="kicker">Not included</p>
                <ul className="tick exc">
                  {trip.excluded.map((x, i) => <li key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(x) }} />)}
                </ul>
                {trip.excludedNote && <p className="note" style={{ marginTop: "1.2rem" }}>{trip.excludedNote}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-in">
            <h2 className="pre">{trip.notesTitle}</h2>
            <p className="lede pre">{trip.notesLede}</p>
            <div className="cards">
              {(trip.notes || []).map((n, i) => (
                <div className="card pre" key={i}>
                  <h3>{n.h}</h3>
                  <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.p) }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-in">
            <h2 className="pre">{trip.stopsTitle}</h2>
            <p className="lede pre">{trip.stopsLede}</p>
            <ul className="stops">
              {(trip.stops || []).map((s, i) => (
                <li key={i}><b>{s[0]}</b><span>{s[1]}</span></li>
              ))}
            </ul>
            {trip.stopsNote && <p className="note" style={{ marginTop: "1.2rem" }}>{trip.stopsNote}</p>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-in">
            <h2 className="pre">Pack this</h2>
            <ul className="pack">
              {(trip.packing || []).map((p, i) => (
                <li key={i} className={p[1] ? "must" : ""}>{p[0]}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="panel">
          <div className="panel-in">
            <h2 className="pre">If you cancel</h2>
            <p className="lede pre">{trip.cancelLede}</p>
            <div className="charges">
              {(trip.charges || []).map((c, i) => (
                <div className="charge pre" key={i}><b>{c[0]}</b><span>{c[1]}</span></div>
              ))}
            </div>
            {trip.cancelNote && <p className="note" style={{ marginTop: "1.2rem" }}>{trip.cancelNote}</p>}
          </div>
        </section>

        <section className="panel" id="faq">
          <div className="panel-in">
            <h2 className="pre">Questions</h2>
            <div style={{ marginTop: "1.2rem" }}>
              {(trip.faqs || []).map((f, i) => (
                <details key={i}>
                  <summary>{f.q}<i>+</i></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PriceBar trip={trip} whatsapp={whatsapp} />
    </div>
  );
}
