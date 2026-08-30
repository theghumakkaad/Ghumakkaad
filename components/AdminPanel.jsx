"use client";
import { useEffect, useState } from "react";
import { trips as seedTrips, site as seedSite } from "@/lib/trips";
import { money } from "@/lib/format";
import { supabase, hasSupabase } from "@/lib/supabase";
import { saveTrip, deleteTrip, loadTrips } from "@/lib/admin-db";

/* ============================================================
   ADMIN
   A packages list and an edit form. Changes are held in this
   browser; Export writes lib/trips.js back out for you to commit.
   The password is a gate, not security — swap it for real auth
   when this moves onto a database.
   ============================================================ */
const KEY = "ghumakkaad.content.v1";

const blank = () => ({
  slug: "new-trip-" + Date.now().toString(36),
  name: "New package", terrain: "desert", kicker: "", sub: "",
  duration: "3 days / 2 nights", cardImage: "", active: true, facts: [],
  fareLabel: "Option", gstPercent: 0, seasonRate: 0, seasonWindows: [], seasonalDates: [],
  fares: [{ id: "f0", label: "Standard", note: "", price: 0 }],
  addons: [], addonLabel: "", dates: [],
  days: [{ tag: "Day 1 · Start", title: "Day one", meals: "", acts: ["First activity"] }],
  included: [], excluded: [], excludedNote: "",
  notesTitle: "Things worth knowing", notesLede: "", notes: [],
  stopsTitle: "Where it starts", stopsLede: "", stops: [], stopsNote: "",
  packing: [], cancelLede: "", charges: [], cancelNote: "", faqs: [],
  scenes: [{ anchor: ".hero", frac: 0.5, type: "video", src: "4149", tint: "20,14,8,.3", rain: 0.3 }],
});

export default function AdminPanel() {
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState({ site: seedSite, trips: seedTrips });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  /* sign-in errors need to stay on screen; flash() clears itself */
  const [err, setErr] = useState("");

  useEffect(() => {
    document.body.classList.add("adm");
    /* already signed in? */
    if (hasSupabase) {
      supabase.auth.getSession().then(({ data: s }) => {
        if (s?.session) { setOk(true); refresh(); }
      });
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY));
        if (saved?.trips) setData(saved);
      } catch {}
    }
    return () => document.body.classList.remove("adm");
  }, []);

  async function refresh() {
    if (!hasSupabase) return;
    const next = await loadTrips();
    if (next?.trips?.length) setData(next);
  }

  async function signIn(e) {
    e?.preventDefault();
    setErr("");
    if (!hasSupabase) { flash("Supabase is not configured, so edits stay in this browser"); setOk(true); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    setOk(true);
    refresh();
  }

  async function signOut() {
    if (hasSupabase) await supabase.auth.signOut();
    setOk(false);
  }

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 1800); };
  const persist = async (next, note, changed) => {
    setData(next);
    if (hasSupabase && changed) {
      const { error } = await saveTrip(changed);
      if (error) return flash("Could not save: " + error);
      flash(note || "Saved to the database");
      return;
    }
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    flash(note || "Saved in this browser");
  };

  /* The sign-in screen. Labels sit above their fields rather than
     living in the placeholder, the error stays put instead of fading
     after a second and a half, and it is a real form so Enter and a
     password manager both behave. */
  if (!ok) {
    return (
      <main className="lock-page">
        <form className="lockbox" onSubmit={signIn} noValidate>
          <p className="lock-mark">GHUMAKKAAD</p>
          <h1>Trip desk</h1>
          <p className="lock-sub">
            {hasSupabase
              ? "Sign in with the account you created in Supabase."
              : "Supabase is not connected, so anything you change is kept in this browser only."}
          </p>

          {hasSupabase && (
            <div className="fld">
              <label htmlFor="adm-email">Email</label>
              <input id="adm-email" type="email" value={email} autoComplete="username"
                onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}

          <div className="fld">
            <label htmlFor="adm-pw">Password</label>
            <input id="adm-pw" type="password" value={pw} autoComplete="current-password"
              aria-describedby={err ? "adm-err" : undefined}
              aria-invalid={err ? "true" : undefined}
              onChange={(e) => setPw(e.target.value)} />
            {err && <p className="fld-err" id="adm-err" role="alert">{err}</p>}
          </div>

          <button className="pill lock-go" type="submit" disabled={busy}>
            {busy ? "Checking…" : hasSupabase ? "Sign in" : "Open the desk"}
          </button>

          <a className="lock-back" href="/">Back to the site</a>
        </form>
        {msg && <div className="saved on">{msg}</div>}
      </main>
    );
  }

  return (
    <>
      <div className="adm-bar">
        <b>GHUMAKKAAD ADMIN</b>
        <button onClick={() => setEditing(null)}>Packages</button>
        <button onClick={() => { const t = blank(); persist({ ...data, trips: [...data.trips, t] }, "Package created", t); setEditing(data.trips.length); }}>
          New Package
        </button>
        <span className="sp" />
        <a href="/" target="_blank" rel="noopener">View Site ↗</a>
        <button onClick={signOut}>Log Out</button>
      </div>

      <main className="adm-main">
        {editing === null
          ? <List data={data} onEdit={setEditing} onChange={persist} />
          : <Editor trip={data.trips[editing]} onCancel={() => setEditing(null)}
              onSave={(t) => {
                const trips = data.trips.slice();
                trips[editing] = t;
                persist({ ...data, trips }, "Package saved", t);
                setEditing(null);
              }} />}
      </main>
      {msg && <div className="saved on">{msg}</div>}
    </>
  );
}

function List({ data, onEdit, onChange }) {
  const low = (t) => Math.min(...(t.fares || []).map((f) => Number(f.price) || 0));

  const exportFile = () => {
    const out =
      "/* Content for the site. Exported from the admin. */\n\n" +
      "export const site = " + JSON.stringify(data.site, null, 2) + ";\n\n" +
      "export const trips = " + JSON.stringify(data.trips, null, 2) + ";\n\n" +
      `export const activeTrips = () => trips.filter((t) => t.active !== false);
export const getTrip = (slug) => trips.find((t) => t.slug === slug) || null;
export const fromPrice = (t) => Math.min(...(t.fares || []).map((f) => Number(f.price) || 0));
export const upcomingDates = (t) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const up = (t.dates || []).filter((d) => new Date(d + "T00:00:00").getTime() >= today);
  return up.length ? up : t.dates || [];
};
export const isSeasonDate = (t, d) => {
  if (!d || !t.seasonRate) return false;
  if ((t.seasonalDates || []).includes(d)) return true;
  return (t.seasonWindows || []).some((w) => d >= w[0] && d <= w[1]);
};
export const waLink = (msg) => \`https://wa.me/\${site.whatsapp}?text=\${encodeURIComponent(msg)}\`;
export const money = (n) => "\\u20B9" + Number(n || 0).toLocaleString("en-IN");
export const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const fmtLong = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out], { type: "text/javascript" }));
    a.download = "trips.js";
    a.click();
  };

  return (
    <>
      <div className="adm-head">
        <div><h1>Packages</h1><p>Edit prices, dates and itineraries.</p></div>
        <button className="pill" onClick={() => {
          const t = blank();
          onChange({ ...data, trips: [...data.trips, t] }, "Package created", t);
          onEdit(data.trips.length);
        }}>+ New Package</button>
      </div>

      <table className="tbl">
        <thead><tr>
          <th>Title</th><th>Type</th><th>Duration</th><th>Price (pp)</th>
          <th>Status</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {data.trips.map((t, i) => (
            <tr key={t.slug + i}>
              <td className="name">{t.name}</td>
              <td style={{ textTransform: "capitalize" }}>{t.terrain}</td>
              <td>{t.duration}</td>
              <td className="price">{money(low(t))}</td>
              <td><span className={"tag" + (t.active === false ? " off" : "")}>
                {t.active === false ? "Hidden" : "Active"}</span></td>
              <td className="act" style={{ textAlign: "right" }}>
                <a href={`/packages/${t.slug}`} target="_blank" rel="noopener">View</a>
                <button onClick={() => onEdit(i)}>Edit</button>
                <button className="del" onClick={async () => {
                  if (!confirm(`Delete "${t.name}"?`)) return;
                  await deleteTrip(t.slug);
                  onChange({ ...data, trips: data.trips.filter((_, j) => j !== i) }, "Deleted");
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="savebar">
        <span className="note">
          Changes live in this browser. Export, replace <code>lib/trips.js</code>, redeploy.
        </span>
        <button className="pill pill-ghost" onClick={exportFile}>Export lib/trips.js</button>
      </div>
    </>
  );
}

/* ---------- the edit form ---------- */
function Editor({ trip, onSave, onCancel }) {
  const [t, setT] = useState(() => JSON.parse(JSON.stringify(trip)));
  const set = (k, v) => setT((x) => ({ ...x, [k]: v }));

  /* list helpers */
  const addTo = (k, empty) => set(k, [...(t[k] || []), empty]);
  const cut = (k, i) => set(k, t[k].filter((_, j) => j !== i));
  const put = (k, i, v) => set(k, t[k].map((x, j) => (j === i ? v : x)));

  const Rows = ({ k, label, ph }) => (
    <div className="fld">
      <label>{label}</label>
      <div className="rows">
        {(t[k] || []).map((v, i) => (
          <div className="row" key={i}>
            <input value={v} placeholder={ph} onChange={(e) => put(k, i, e.target.value)} />
            <button type="button" className="x" onClick={() => cut(k, i)}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" className="addbtn" onClick={() => addTo(k, "")}>+ Add</button>
    </div>
  );

  const Pairs = ({ k, label, ph1, ph2, map = (x) => x, unmap = (x) => x }) => (
    <div className="fld">
      <label>{label}</label>
      <div className="rows">
        {(t[k] || []).map((raw, i) => {
          const p = map(raw);
          return (
            <div className="row" key={i}>
              <input value={p[0]} placeholder={ph1} style={{ flex: "0 0 34%" }}
                onChange={(e) => put(k, i, unmap([e.target.value, p[1]]))} />
              <input value={p[1]} placeholder={ph2}
                onChange={(e) => put(k, i, unmap([p[0], e.target.value]))} />
              <button type="button" className="x" onClick={() => cut(k, i)}>✕</button>
            </div>
          );
        })}
      </div>
      <button type="button" className="addbtn" onClick={() => addTo(k, unmap(["", ""]))}>+ Add</button>
    </div>
  );

  const F = ({ id, label, val, onChange, type = "text" }) => (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={val ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );

  return (
    <>
      <div className="adm-head">
        <div><h1>Edit {t.name}</h1><p>Everything a visitor sees on this trip page.</p></div>
        <button className="pill pill-ghost" onClick={onCancel}>← All packages</button>
      </div>

      <div className="acard">
        <h3>Basics</h3>
        <div className="g2">
          <F id="name" label="Title" val={t.name} onChange={(v) => set("name", v)} />
          <F id="slug" label="Slug (URL)" val={t.slug} onChange={(v) => set("slug", v)} />
          <F id="kicker" label="Subtitle" val={t.kicker} onChange={(v) => set("kicker", v)} />
          <div className="fld">
            <label htmlFor="terrain">Destination type</label>
            <select id="terrain" value={t.terrain} onChange={(e) => set("terrain", e.target.value)}>
              {["desert", "snow", "monsoon", "beach", "hills"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <F id="duration" label="Duration" val={t.duration} onChange={(v) => set("duration", v)} />
          <F id="card" label="Hero / card image URL" val={t.cardImage} onChange={(v) => set("cardImage", v)} />
        </div>
        <div className="fld" style={{ marginTop: 14 }}>
          <label htmlFor="sub">Short description (cards and meta)</label>
          <textarea id="sub" value={t.sub} onChange={(e) => set("sub", e.target.value)} />
        </div>
        <div className="g2" style={{ marginTop: 14 }}>
          <div className="fld">
            <label htmlFor="active">Visible on site</label>
            <select id="active" value={t.active === false ? "Hidden" : "Active"}
              onChange={(e) => set("active", e.target.value === "Active")}>
              <option>Active</option><option>Hidden</option>
            </select>
          </div>
          <F id="fareLabel" label="What the price choice is called" val={t.fareLabel} onChange={(v) => set("fareLabel", v)} />
        </div>
        <Rows k="facts" label="Hero facts" ph="e.g. <b>3</b> days / <b>2</b> nights" />
      </div>

      <div className="acard">
        <h3>Day-by-day itinerary</h3>
        <p className="sub">The day label is what shows in the track at the top of the page.</p>
        {(t.days || []).map((d, i) => (
          <div className="daycard" key={i}>
            <div className="daytop">
              <input value={d.tag} placeholder="Day 1 · Shimla"
                onChange={(e) => put("days", i, { ...d, tag: e.target.value })} />
              <input value={d.title} placeholder="Heading"
                onChange={(e) => put("days", i, { ...d, title: e.target.value })} />
              <button type="button" className="mv" onClick={() => {
                if (i === 0) return;
                const ds = t.days.slice(); [ds[i - 1], ds[i]] = [ds[i], ds[i - 1]]; set("days", ds);
              }}>↑</button>
              <button type="button" className="mv" onClick={() => {
                if (i === t.days.length - 1) return;
                const ds = t.days.slice(); [ds[i + 1], ds[i]] = [ds[i], ds[i + 1]]; set("days", ds);
              }}>↓</button>
              <button type="button" className="x" onClick={() => cut("days", i)}>✕</button>
            </div>
            <div className="fld">
              <label>Activities — one per line</label>
              <textarea value={(d.acts || []).join("\n")}
                onChange={(e) => put("days", i, { ...d, acts: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
            </div>
            <div className="fld" style={{ marginTop: 10 }}>
              <label>Meals</label>
              <input value={d.meals || ""} placeholder="Breakfast · Dinner"
                onChange={(e) => put("days", i, { ...d, meals: e.target.value })} />
            </div>
          </div>
        ))}
        <button type="button" className="addbtn"
          onClick={() => addTo("days", { tag: `Day ${(t.days || []).length + 1} · `, title: "", meals: "", acts: [] })}>
          + Add Day
        </button>
      </div>

      <div className="acard">
        <h3>Pricing</h3>
        <div className="fld">
          <label>Tiers</label>
          <div className="rows">
            {(t.fares || []).map((f, i) => (
              <div className="row" key={i}>
                <input value={f.label} placeholder="4 Sharing" style={{ flex: "0 0 28%" }}
                  onChange={(e) => put("fares", i, { ...f, label: e.target.value })} />
                <input value={f.note || ""} placeholder="Note"
                  onChange={(e) => put("fares", i, { ...f, note: e.target.value })} />
                <input type="number" value={f.price} placeholder="Price" style={{ flex: "0 0 110px" }}
                  onChange={(e) => put("fares", i, { ...f, price: Number(e.target.value) || 0 })} />
                <input type="number" value={f.child ?? ""} placeholder="Child" style={{ flex: "0 0 100px" }}
                  onChange={(e) => put("fares", i, { ...f, child: e.target.value === "" ? undefined : Number(e.target.value) })} />
                <button type="button" className="x" onClick={() => cut("fares", i)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="addbtn"
            onClick={() => addTo("fares", { id: "f" + (t.fares || []).length, label: "", note: "", price: 0 })}>+ Add Tier</button>
        </div>
        <div className="g2" style={{ marginTop: 14 }}>
          <F id="gst" type="number" label="GST percent (0 for none)" val={t.gstPercent}
            onChange={(v) => set("gstPercent", Number(v) || 0)} />
          <F id="season" type="number" label="Season surcharge per person" val={t.seasonRate}
            onChange={(v) => set("seasonRate", Number(v) || 0)} />
        </div>
        <div className="fld" style={{ marginTop: 14 }}>
          <label>Add-ons (optional)</label>
          <div className="rows">
            {(t.addons || []).map((a, i) => (
              <div className="row" key={i}>
                <input value={a.label} placeholder="Couple tent" style={{ flex: "0 0 32%" }}
                  onChange={(e) => put("addons", i, { ...a, label: e.target.value })} />
                <input value={a.note || ""} placeholder="Note"
                  onChange={(e) => put("addons", i, { ...a, note: e.target.value })} />
                <input type="number" value={a.add} placeholder="Extra" style={{ flex: "0 0 110px" }}
                  onChange={(e) => put("addons", i, { ...a, add: Number(e.target.value) || 0 })} />
                <button type="button" className="x" onClick={() => cut("addons", i)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="addbtn"
            onClick={() => addTo("addons", { id: "a" + (t.addons || []).length, label: "", note: "", add: 0 })}>+ Add</button>
        </div>
        <F id="addonLabel" label="Add-on label" val={t.addonLabel} onChange={(v) => set("addonLabel", v)} />
      </div>

      <div className="acard">
        <h3>Departure dates</h3>
        <p className="sub">Tick Seasonal to apply the surcharge above to that date.</p>
        <div className="dategrid">
          {(t.dates || []).map((d, i) => (
            <div className="daterow" key={i}>
              <input type="date" value={d} onChange={(e) => {
                const next = t.dates.slice(); next[i] = e.target.value; set("dates", next);
              }} />
              <label>
                <input type="checkbox" checked={(t.seasonalDates || []).includes(d)}
                  onChange={(e) => set("seasonalDates", e.target.checked
                    ? [...(t.seasonalDates || []), d]
                    : (t.seasonalDates || []).filter((x) => x !== d))} />
                Seasonal
              </label>
              <button type="button" className="x" onClick={() => cut("dates", i)}>✕</button>
            </div>
          ))}
        </div>
        <button type="button" className="addbtn" onClick={() => addTo("dates", "")}>+ Add Date</button>
      </div>

      <div className="acard">
        <h3>Inclusions &amp; exclusions</h3>
        <Rows k="included" label="Included" ph="What is covered" />
        <Rows k="excluded" label="Not included" ph="What is not" />
        <div className="fld"><label>Note under exclusions</label>
          <textarea value={t.excludedNote || ""} onChange={(e) => set("excludedNote", e.target.value)} /></div>
      </div>

      <div className="acard">
        <h3>Before you book</h3>
        <div className="g2">
          <F id="nt" label="Section title" val={t.notesTitle} onChange={(v) => set("notesTitle", v)} />
          <F id="nl" label="Section intro" val={t.notesLede} onChange={(v) => set("notesLede", v)} />
        </div>
        <Pairs k="notes" label="Cards" ph1="Heading" ph2="Text"
          map={(n) => [n.h, n.p]} unmap={(p) => ({ h: p[0], p: p[1] })} />
      </div>

      <div className="acard">
        <h3>Pickup &amp; boarding</h3>
        <div className="g2">
          <F id="st" label="Section title" val={t.stopsTitle} onChange={(v) => set("stopsTitle", v)} />
          <F id="sl" label="Section intro" val={t.stopsLede} onChange={(v) => set("stopsLede", v)} />
        </div>
        <Pairs k="stops" label="Pickup points" ph1="Place" ph2="Where exactly" />
        <div className="fld"><label>Note under pickups</label>
          <textarea value={t.stopsNote || ""} onChange={(e) => set("stopsNote", e.target.value)} /></div>
      </div>

      <div className="acard">
        <h3>Packing, cancellation &amp; questions</h3>
        <Pairs k="packing" label="Packing list" ph1="Item" ph2="must (optional)"
          map={(p) => [p[0], p[1] ? "must" : ""]}
          unmap={(p) => [p[0], /must/i.test(p[1]) ? 1 : 0]} />
        <div className="fld"><label>Cancellation intro</label>
          <textarea value={t.cancelLede || ""} onChange={(e) => set("cancelLede", e.target.value)} /></div>
        <Pairs k="charges" label="Cancellation charges" ph1="10%" ph2="When" />
        <div className="fld"><label>Cancellation note</label>
          <textarea value={t.cancelNote || ""} onChange={(e) => set("cancelNote", e.target.value)} /></div>
        <Pairs k="faqs" label="Questions" ph1="Question" ph2="Answer"
          map={(f) => [f.q, f.a]} unmap={(p) => ({ q: p[0], a: p[1] })} />
      </div>

      <div className="acard">
        <h3>Backgrounds</h3>
        <p className="sub">Which clip or photo sits behind each part of the page.</p>
        <div className="rows">
          {(t.scenes || []).map((s, i) => (
            <div className="row" key={i}>
              <input value={s.anchor} placeholder=".hero or #d1" style={{ flex: "0 0 110px" }}
                onChange={(e) => put("scenes", i, { ...s, anchor: e.target.value })} />
              <input type="number" step="0.05" value={s.frac} style={{ flex: "0 0 80px" }}
                onChange={(e) => put("scenes", i, { ...s, frac: Number(e.target.value) })} />
              <select value={s.type} style={{ flex: "0 0 90px" }}
                onChange={(e) => put("scenes", i, { ...s, type: e.target.value })}>
                <option>video</option><option>image</option>
              </select>
              <input value={s.src} placeholder="Mixkit id, or image URL"
                onChange={(e) => put("scenes", i, { ...s, src: e.target.value })} />
              <button type="button" className="x" onClick={() => cut("scenes", i)}>✕</button>
            </div>
          ))}
        </div>
        <button type="button" className="addbtn"
          onClick={() => addTo("scenes", { anchor: "#d1", frac: 0.5, type: "video", src: "", tint: "20,16,10,.3", rain: 0.3 })}>
          + Add
        </button>
      </div>

      <div className="savebar">
        <span className="note">Saved in this browser until you export.</span>
        <button className="pill pill-ghost" onClick={onCancel}>Cancel</button>
        <button className="pill" onClick={() => onSave({
          ...t,
          childRates: (t.fares || []).some((f) => typeof f.child === "number"),
          dates: [...(t.dates || [])].filter(Boolean).sort(),
        })}>Save Package</button>
      </div>
    </>
  );
}
