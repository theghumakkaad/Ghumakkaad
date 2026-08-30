import { getSite } from "@/lib/db";

export default async function robots() {
  const site = await getSite();
  const base = site.url || "https://ghumakkaad.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
