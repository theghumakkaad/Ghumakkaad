import { getTrips, getSite } from "@/lib/db";

export default async function sitemap() {
  const [trips, site] = await Promise.all([getTrips(), getSite()]);
  const base = site.url || "https://ghumakkaad.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/packages`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...trips.map((t) => ({
      url: `${base}/packages/${t.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    })),
  ];
}
