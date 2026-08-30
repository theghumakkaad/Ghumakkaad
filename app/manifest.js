import { site } from "@/lib/trips";

/* Lets a phone "Add to Home Screen" with the right name, icon and
   theme colour instead of a bare browser tab — worth having since most
   traffic here arrives from a WhatsApp link on a phone. Next.js serves
   this at /manifest.webmanifest automatically because the file lives
   at app/manifest.js. */
export default function manifest() {
  return {
    name: `${site.name} — fixed departure group trips`,
    short_name: site.name,
    description: site.blurb,
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0C",
    theme_color: "#0A0A0C",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
