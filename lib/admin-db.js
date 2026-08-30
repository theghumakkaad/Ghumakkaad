"use client";
import { supabase, hasSupabase } from "./supabase";
import { sanitizeHtml } from "./sanitize";

/* ============================================================
   Writing from the admin.
   Every one of these needs a signed-in session — row level
   security rejects them otherwise, which is the point.
   ============================================================ */

/* our trip shape -> the packages row.

   facts/included/excluded/notes[].p render through
   dangerouslySetInnerHTML on the trip page (components/TripPage.jsx),
   so whatever is typed here becomes real markup on the live site.
   Cleaning it on the way into the database, in addition to sanitizing
   again at render time, means the stored data is trustworthy on its
   own. */
function toRow(t) {
  return {
    slug: t.slug,
    name: t.name,
    terrain: t.terrain,
    kicker: t.kicker || "",
    sub: t.sub || "",
    duration: t.duration || "",
    card_image: t.cardImage || "",
    active: t.active !== false,
    featured: !!t.featured,
    display_order: t.order ?? 0,
    fare_label: t.fareLabel || "Option",
    addon_label: t.addonLabel || "",
    gst_percent: Number(t.gstPercent) || 0,
    season_rate: Number(t.seasonRate) || 0,
    season_windows: t.seasonWindows || [],
    facts: (t.facts || []).map(sanitizeHtml),
    included: (t.included || []).map(sanitizeHtml),
    excluded: (t.excluded || []).map(sanitizeHtml),
    excluded_note: t.excludedNote || "",
    notes_title: t.notesTitle || "",
    notes_lede: t.notesLede || "",
    notes: (t.notes || []).map((n) => ({ ...n, p: sanitizeHtml(n.p) })),
    stops_title: t.stopsTitle || "",
    stops_lede: t.stopsLede || "",
    stops: t.stops || [],
    stops_note: t.stopsNote || "",
    packing: t.packing || [],
    cancel_lede: t.cancelLede || "",
    charges: t.charges || [],
    cancel_note: t.cancelNote || "",
    faqs: t.faqs || [],
    addons: t.addons || [],
    scenes: t.scenes || [],
    seo_title: t.seoTitle || "",
    seo_description: t.seoDescription || t.sub || "",
    seo_keywords: t.seoKeywords || "",
  };
}

export async function saveTrip(t) {
  if (!hasSupabase) return { error: "Supabase is not configured" };
  try {
    /* the package itself */
    const { data: pkg, error: e1 } = await supabase
      .from("packages")
      .upsert(toRow(t), { onConflict: "slug" })
      .select("id")
      .single();
    if (e1) throw e1;
    const id = pkg.id;

    /* children are replaced wholesale — simpler and always correct,
       and these lists are small */
    await supabase.from("itinerary_days").delete().eq("package_id", id);
    if ((t.days || []).length) {
      const { error } = await supabase.from("itinerary_days").insert(
        t.days.map((d, i) => ({
          package_id: id, position: i, tag: d.tag || "",
          title: d.title || "", meals: d.meals || "", acts: d.acts || [],
        }))
      );
      if (error) throw error;
    }

    await supabase.from("pricing_tiers").delete().eq("package_id", id);
    if ((t.fares || []).length) {
      const { error } = await supabase.from("pricing_tiers").insert(
        t.fares.map((f, i) => ({
          package_id: id, position: i, label: f.label || "",
          note: f.note || "", price: Number(f.price) || 0,
          child_price: typeof f.child === "number" ? f.child : null,
        }))
      );
      if (error) throw error;
    }

    await supabase.from("departure_dates").delete().eq("package_id", id);
    const dates = (t.dates || []).filter(Boolean);
    if (dates.length) {
      const seasonal = new Set(t.seasonalDates || []);
      const { error } = await supabase.from("departure_dates").insert(
        dates.map((d) => ({ package_id: id, date: d, seasonal: seasonal.has(d) }))
      );
      if (error) throw error;
    }

    return { error: null };
  } catch (e) {
    return { error: e.message || String(e) };
  }
}

export async function deleteTrip(slug) {
  if (!hasSupabase) return { error: null };
  const { error } = await supabase.from("packages").delete().eq("slug", slug);
  return { error: error?.message || null };
}

/* the admin needs hidden packages too, which the public read policy
   does not return — a signed-in session does */
export async function loadTrips() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase
    .from("packages")
    .select("*, itinerary_days(*), pricing_tiers(*), departure_dates(*)")
    .order("display_order", { ascending: true });
  if (error || !data) return null;

  const trips = data.map((p) => ({
    slug: p.slug, name: p.name, terrain: p.terrain, kicker: p.kicker || "",
    sub: p.sub || "", duration: p.duration || "", cardImage: p.card_image || "",
    active: p.active !== false, featured: !!p.featured, order: p.display_order ?? 0,
    fareLabel: p.fare_label || "Option", addonLabel: p.addon_label || "",
    gstPercent: Number(p.gst_percent) || 0, seasonRate: Number(p.season_rate) || 0,
    seasonWindows: p.season_windows || [],
    fares: (p.pricing_tiers || []).sort((a, b) => a.position - b.position).map((f, i) => ({
      id: "f" + i, label: f.label, note: f.note || "", price: Number(f.price) || 0,
      ...(f.child_price == null ? {} : { child: Number(f.child_price) }),
    })),
    addons: p.addons || [],
    days: (p.itinerary_days || []).sort((a, b) => a.position - b.position).map((d) => ({
      tag: d.tag, title: d.title, meals: d.meals, acts: d.acts || [],
    })),
    dates: (p.departure_dates || []).map((d) => d.date).sort(),
    seasonalDates: (p.departure_dates || []).filter((d) => d.seasonal).map((d) => d.date),
    facts: p.facts || [], included: p.included || [], excluded: p.excluded || [],
    excludedNote: p.excluded_note || "", notesTitle: p.notes_title || "",
    notesLede: p.notes_lede || "", notes: p.notes || [],
    stopsTitle: p.stops_title || "", stopsLede: p.stops_lede || "",
    stops: p.stops || [], stopsNote: p.stops_note || "",
    packing: p.packing || [], cancelLede: p.cancel_lede || "",
    charges: p.charges || [], cancelNote: p.cancel_note || "",
    faqs: p.faqs || [], scenes: p.scenes || [],
    seoTitle: p.seo_title || "", seoDescription: p.seo_description || "",
  }));

  const { data: s } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const site = s ? {
    name: s.name, url: s.url, tagline: s.tagline, blurb: s.blurb, whatsapp: s.whatsapp,
    phoneDisplay: s.phone_display, email: s.email, address: s.address,
    heroKicker: s.hero_kicker, heroTitle: s.hero_title, heroSub: s.hero_sub, heroVideo: s.hero_video,
  } : null;

  return { trips, site: site || undefined };
}
