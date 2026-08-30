/* ============================================================
   A real srcset for the two hotlinked photo sources this site uses.

   Both HeroStage.jsx and TripIndex.jsx used to carry their own copy of
   an Unsplash-only version of this (a real srcset lets a phone pull
   its own size instead of the same 1800px file a desktop hero gets),
   with a comment noting Wikimedia thumbnails were "left as the single
   URL they already are" because they encode width in the path, not a
   query param. They don't have to be: a Wikimedia thumb URL looks like

     .../thumb/7/76/Jodhpur_from_Fort.jpg/900px-Jodhpur_from_Fort.jpg

   and swapping the "900px-" prefix on the last segment is all a
   different width takes. Pulled into one place so both plain <img>
   sites (there is no next/image step here — see the comment in
   HeroStage.jsx for why) get the same treatment.
   ============================================================ */

function unsplashSrcSet(url) {
  if (!url || !url.includes("images.unsplash.com") || !/[?&]w=\d+/.test(url)) return undefined;
  return [480, 800, 1200, 1800]
    .map((w) => `${url.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`)
    .join(", ");
}

function wikimediaSrcSet(url) {
  if (!url || !url.includes("upload.wikimedia.org")) return undefined;
  const m = url.match(/^(.*\/)(\d+)px-([^/]+)$/);
  if (!m) return undefined;
  const [, prefix, , filename] = m;
  return [480, 800, 1200, 1600, 2000]
    .map((w) => `${prefix}${w}px-${filename} ${w}w`)
    .join(", ");
}

export function responsiveSrcSet(url) {
  return unsplashSrcSet(url) || wikimediaSrcSet(url);
}

/* Wikimedia Commons photographs are CC BY-SA, which requires visible
   attribution linking back to the file — README.md already flagged
   this as unresolved. This turns a thumbnail URL back into the file's
   Commons page (the segment right before the "NNNpx-" one is the
   original filename, already percent-encoded the way a URL needs) so
   a trip page can show a real credit link rather than using the
   photograph with no attribution at all. */
export function wikimediaFilePage(url) {
  if (!url || !url.includes("upload.wikimedia.org")) return null;
  const m = url.match(/\/([^/]+)\/\d+px-[^/]+$/);
  if (!m) return null;
  return `https://commons.wikimedia.org/wiki/File:${m[1]}`;
}
