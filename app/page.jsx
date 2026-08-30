import Journey from "@/components/Journey";
import { getTrips, getSite } from "@/lib/db";
import { buildCards, buildHeroSlides } from "@/lib/cards";

export const revalidate = 300;

export async function generateMetadata() {
  const site = await getSite();
  const title = `${site.name} — one road, four seasons`;
  return {
    title,
    description: site.blurb,
    alternates: { canonical: "/" },
    /* trip pages already set their own openGraph/twitter; the home page had
       neither, so a link shared to WhatsApp or Twitter fell back to a bare
       title with no image. The opengraph-image.png file convention supplies
       the picture; this just makes sure the text fields are here too. */
    openGraph: { type: "website", url: "/", title, description: site.blurb },
    twitter: { card: "summary_large_image", title, description: site.blurb },
  };
}

/* the trips themselves, so search engines see the catalogue on the home page */
function HomeSchema({ site, cards }) {
  const base = site.url || "https://ghumakkaad.com";
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cards
      .filter((c) => c.slug)
      .map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url: `${base}/packages/${c.slug}`,
      })),
  };
  return <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default async function Home() {
  const [trips, site] = await Promise.all([getTrips(), getSite()]);
  const cards = buildCards(trips);
  const slides = buildHeroSlides(cards);

  /* Only what the client component renders crosses the boundary, and
     the year is stamped on the server so the footer cannot disagree
     with itself during hydration. */
  const brand = {
    whatsapp: site.whatsapp,
    phoneDisplay: site.phoneDisplay,
    email: site.email,
    tagline: site.tagline,
    instagram: site.instagram || "",
    year: new Date().getFullYear(),
  };

  return (
    <>
      <HomeSchema site={site} cards={cards} />
      <Journey cards={cards} slides={slides} site={brand} />
    </>
  );
}
