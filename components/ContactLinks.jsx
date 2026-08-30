"use client";
import { EnvelopeSimple, InstagramLogo, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { trackCall, trackEmail, trackWhatsApp } from "@/lib/analytics";

/* SiteFooter is an async server component (it reads the database), and
   a server component can't hand a plain DOM element an onClick — the
   function can't cross the server/client boundary. This is the whole
   click-tracked contact list pulled out into its own client component
   so the footer can stay a server component everywhere else. Mirrors
   what the home page's colophon already links: WhatsApp first (that's
   how bookings actually happen), then phone, email, Instagram. */
export default function ContactLinks({ whatsapp, phoneDisplay, email, instagram, location = "footer" }) {
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Ghumakkaad, I have a question about a trip.")}`
    : null;
  return (
    <>
      {waHref && (
        <li>
          <a href={waHref} rel="noopener" target="_blank" onClick={() => trackWhatsApp("general", location)}>
            <WhatsappLogo size={15} weight="bold" aria-hidden="true" />WhatsApp us
          </a>
        </li>
      )}
      {whatsapp && (
        <li>
          <a href={`tel:+${whatsapp}`} onClick={() => trackCall(location)}>
            <Phone size={15} weight="bold" aria-hidden="true" />{phoneDisplay}
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`} onClick={() => trackEmail(location)}>
            <EnvelopeSimple size={15} weight="bold" aria-hidden="true" />{email}
          </a>
        </li>
      )}
      {instagram && (
        <li>
          <a href={instagram} rel="noopener" target="_blank">
            <InstagramLogo size={15} weight="bold" aria-hidden="true" />Instagram
          </a>
        </li>
      )}
    </>
  );
}
