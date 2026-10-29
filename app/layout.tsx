import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountdownStrip from "@/components/CountdownStrip";
import JsonLd from "@/components/JsonLd";
import { getCountdownParts } from "@/lib/dates";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

const SITE_SCHEMA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    description: SITE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "christmas countdown",
    "days until christmas",
    "merry christmas wishes",
    "christmas wishes",
    "christmas card maker",
    "elf name generator",
    "christmas quiz",
    "christmas wishes in urdu",
    "christmas wishes in hindi",
    "feliz navidad wishes",
    "maligayang pasko wishes",
    "christmas greetings",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  // No site-wide twitter title/description here: each page provides its own
  // via pageMetadata(), and Twitter falls back to the OpenGraph values.
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b3d2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const countdown = getCountdownParts();
  return (
    <html lang="en">
      <body>
        <JsonLd data={SITE_SCHEMA} />
        <CountdownStrip initial={countdown} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
