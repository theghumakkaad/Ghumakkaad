import { notFound } from "next/navigation";
import TripPage from "@/components/TripPage";
import SiteFooter from "@/components/SiteFooter";
import { fromPrice, upcomingDates } from "@/lib/format";
import { getTrips, getTripBySlug, getSite } from "@/lib/db";

/* every trip becomes a real static page at build time */
/* pages refresh themselves, so admin edits appear without a redeploy */
export const revalidate = 300;

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const t = await getTripBySlug(params.slug);
  if (!t) return {};
  const url = `/packages/${t.slug}`;
  const title = `${t.name} — ${t.duration} from Gujarat`;
  const description = t.seoDescription || t.sub;
  return {
    title,
    description,
    keywords: t.seoKeywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "website", url, title, description,
      images: t.cardImage ? [{ url: t.cardImage, width: 1200, height: 630, alt: t.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function TripSchema({ trip, site }) {
  const base = site.url || "https://ghumakkaad.com";
  const url = `${base}/packages/${trip.slug}`;
  const next = upcomingDates(trip)[0];
  const price = fromPrice(trip);

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: `${trip.name} — ${trip.duration}`,
      description: trip.sub,
      url,
      image: trip.cardImage || undefined,
      provider: { "@id": base + "/#organization" },
      /* Offer needs a real price to validate — fromPrice() returns null
         for a trip with no priced fares yet (see lib/format.js), and an
         Offer carrying "price": null is exactly what Google's Rich
         Results Test flags as invalid. Leaving the whole block out
         until a fare exists is honest: there is no offer to advertise
         yet. */
      ...(price != null
        ? {
            offers: {
              "@type": "Offer",
              price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              url,
              ...(next ? { validFrom: next } : {}),
            },
          }
        : {}),
      itinerary: {
        "@type": "ItemList",
        numberOfItems: trip.days.length,
        itemListElement: trip.days.map((d, i) => ({
          "@type": "ListItem", position: i + 1, name: d.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base + "/" },
        { "@type": "ListItem", position: 2, name: "Trips", item: base + "/packages" },
        { "@type": "ListItem", position: 3, name: trip.name, item: url },
      ],
    },
    /* Same reasoning as Offer above: an empty mainEntity array is what
       an empty FAQ list used to produce, and Search Console reads that
       as invalid/empty structured data rather than "no FAQs yet". Only
       emitted once a trip actually has questions on it. */
    ...(trip.faqs?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: trip.faqs.map((f) => ({
              "@type": "Question", name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];
  return (
    <script type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default async function Page({ params }) {
  const [trip, site] = await Promise.all([getTripBySlug(params.slug), getSite()]);
  if (!trip || trip.active === false) notFound();
  return (
    <>
      <TripSchema trip={trip} site={site} />
      <TripPage trip={trip} whatsapp={site.whatsapp} />
      <SiteFooter />
    </>
  );
}
