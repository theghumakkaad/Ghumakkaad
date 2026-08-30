import DOMPurify from "isomorphic-dompurify";

/* ============================================================
   Admin-entered fields that render as real markup, not text.

   trip.facts, trip.included, trip.excluded and notes[].p all go
   through dangerouslySetInnerHTML in components/TripPage.jsx so that
   "<b>3</b> days" can render bold. That is also, unfiltered, a stored
   XSS hole: whoever can sign in to /admin could put a <script> tag in
   a field meant for "<b>3</b> days" and have it run on every visitor's
   browser. CHANGES.md already records fixing one bug of exactly this
   shape (the old renderPackages() innerHTML in the admin) — this
   closes the remaining ones.

   isomorphic-dompurify wraps DOMPurify with jsdom so it works
   identically during server rendering and in the browser, which
   matters here: TripPage is a client component, but Next still
   renders it once on the server for the initial HTML, and a sanitiser
   that only works in one place would make that HTML disagree with
   what hydration produces. Only the handful of tags these fields
   actually use are allowed through; everything else — script tags,
   event handler attributes, iframes — is stripped. ============================================================ */
const ALLOWED = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "br", "sub", "sup"],
  ALLOWED_ATTR: [],
};

export function sanitizeHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), ALLOWED);
}
