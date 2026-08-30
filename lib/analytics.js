"use client";

/* ============================================================
   Every call to action on this site hands off to WhatsApp, a phone
   call or an email — there was no way to tell which trip, which page,
   or which channel actually produced an enquiry. This fires a GA4
   event alongside the handoff so that's answerable once Analytics
   (see app/layout.jsx) has a real Measurement ID.

   Safe to call even when analytics isn't configured: gtag only exists
   on window once app/layout.jsx's Analytics component has loaded it,
   which only happens when NEXT_PUBLIC_GA_ID is set. Until then this is
   a no-op, not an error.
   ============================================================ */
export function trackEvent(name, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

export const trackWhatsApp = (trip, location) =>
  trackEvent("whatsapp_click", { trip: trip || "unknown", location });

export const trackCall = (location) => trackEvent("phone_click", { location });

export const trackEmail = (location) => trackEvent("email_click", { location });
