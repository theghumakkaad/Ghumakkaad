"use client";
import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { trackWhatsApp } from "@/lib/analytics";

/* The /packages and trip-page footer used to go straight from the last
   section into three columns of links — no closing prompt, unlike the
   home page which always lands on a big "Ask about a trip" band right
   before its own footer. This gives this footer the same kind of
   anchor instead of starting cold on link lists. */
export default function FooterCta({ whatsapp }) {
  if (!whatsapp) return null;
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Ghumakkaad, I have a question about a trip.")}`;
  return (
    <a className="sf-cta" href={href} rel="noopener" target="_blank"
      onClick={() => trackWhatsApp("general", "sitefoot_cta")}>
      <WhatsappLogo size={18} weight="bold" aria-hidden="true" />
      <span>Still deciding? Ask us on WhatsApp — real answers, not a bot.</span>
    </a>
  );
}
