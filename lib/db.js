import { supabase, hasSupabase } from "./supabase";
import { trips as localTrips, site as localSite } from "./trips";

/* ============================================================
   Reading the site.
   Supabase is the source of truth. lib/trips.js is the fallback
   so the site still builds and serves if the database is
   unreachable or the keys are not set yet.
   ============================================================ */

/* database row -> the shape every component already expects */
function toTrip(p) {
  const days = (p.itinerary_days || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((d) => ({ tag: d.tag, title: d.title, meals: d.meals, acts: d.acts || [] }));

  const fares = (p.pricing_tiers || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((f, i) => ({
      id: "f" + i,
      label: f.label,
      note: f.note || "",
      price: Number(f.price) || 0,
      ...(f.child_price == null ? {} : { child: Number(f.child_price) }),
    }));

  const departures = (p.departure_dates || [])
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    slug: p.slug,
    name: p.name,
    terrain: p.terrain,
    kicker: p.kicker || "",
    sub: p.sub || "",
    duration: p.duration || "",
    cardImage: p.card_image || "",
    active: p.active !== false,
    featured: !!p.featured,
    order: p.display_order ?? 0,

    fareLabel: p.fare_label || "Option",
    addonLabel: p.addon_label || "",
    gstPercent: Number(p.gst_percent) || 0,
    seasonRate: Number(p.season_rate) || 0,
    seasonWindows: p.season_windows || [],

    fares,
    childRates: fares.some((f) => typeof f.child === "number"),
    addons: p.addons || [],
    days,
    dates: departures.map((d) => d.date),
    seasonalDates: departures.filter((d) => d.seasonal).map((d) => d.date),

    facts: p.facts || [],
    included: p.included || [],
    excluded: p.excluded || [],
    excludedNote: p.excluded_note || "",
    notesTitle: p.notes_title || "",
    notesLede: p.notes_lede || "",
    notes: p.notes || [],
    stopsTitle: p.stops_title || "",
    stopsLede: p.stops_lede || "",
    stops: p.stops || [],
    stopsNote: p.stops_note || "",
    packing: p.packing || [],
    cancelLede: p.cancel_lede || "",
    charges: p.charges || [],
    cancelNote: p.cancel_note || "",
    faqs: p.faqs || [],
    scenes: p.scenes || [],

    seoTitle: p.seo_title || "",
    seoDescription: p.seo_description || "",
    seoKeywords: p.seo_keywords || "",
  };
}

const SELECT =
  "*, itinerary_days(*), pricing_tiers(*), departure_dates(*)";

export async function getTrips() {
  if (!hasSupabase) return localTrips.filter((t) => t.active !== false);
  try {
    const { data, error } = await supabase
      .from("packages")
      .select(SELECT)
      .eq("active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    if (!data?.length) return localTrips.filter((t) => t.active !== false);
    return data.map(toTrip);
  } catch (e) {
    console.warn("[Ghumakkaad] Supabase unavailable, using bundled content.", e.message);
    return localTrips.filter((t) => t.active !== false);
  }
}

export async function getTripBySlug(slug) {
  if (!hasSupabase) return localTrips.find((t) => t.slug === slug) || null;
  try {
    const { data, error } = await supabase
      .from("packages")
      .select(SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toTrip(data) : localTrips.find((t) => t.slug === slug) || null;
  } catch {
    return localTrips.find((t) => t.slug === slug) || null;
  }
}

export async function getSite() {
  if (!hasSupabase) return localSite;
  try {
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (!data) return localSite;
    return {
      ...localSite,
      name: data.name, url: data.url, tagline: data.tagline, blurb: data.blurb,
      whatsapp: data.whatsapp, phoneDisplay: data.phone_display, email: data.email,
      address: data.address, heroKicker: data.hero_kicker, heroTitle: data.hero_title,
      heroSub: data.hero_sub, heroVideo: data.hero_video,
    };
  } catch {
    return localSite;
  }
}
