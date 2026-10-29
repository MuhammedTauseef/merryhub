import type { Metadata } from "next";
import CardMaker from "@/components/CardMaker";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/card-maker",
  title: "Free Christmas Card Maker — Make & Share Cards",
  description:
    "Make a Merry Christmas card online for free: pick a design, add a name and message, download the picture and share it on WhatsApp or Facebook. No sign-up.",
  ogDescription:
    "Design a personal Merry Christmas card in seconds and share it with the people you love. Free, no sign-up.",
});

/** The exact steps the maker itself shows (1–4 on the form, then download/share). */
const HOWTO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to make a personalised Christmas card online for free",
  description:
    "Make a Merry Christmas card with the recipient's name on it using the free MerryHub card maker — no sign-up.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Pick a design", text: "Choose one of the festive card designs in the maker.", url: `${SITE_URL}/card-maker` },
    { "@type": "HowToStep", position: 2, name: "Add who it is for", text: "Type the recipient's name — it appears on the card itself.", url: `${SITE_URL}/card-maker` },
    { "@type": "HowToStep", position: 3, name: "Write your message", text: "Write your own Christmas message, or borrow one from the MerryHub wishes library.", url: `${SITE_URL}/card-maker` },
    { "@type": "HowToStep", position: 4, name: "Sign your name", text: "Add your name in the From field so they know who sent it.", url: `${SITE_URL}/card-maker` },
    { "@type": "HowToStep", position: 5, name: "Download or share", text: "Download the finished card as a picture, or share it directly on WhatsApp or Facebook.", url: `${SITE_URL}/card-maker` },
  ],
};

export default function CardMakerPage() {
  return (
    <>
      <JsonLd data={HOWTO_SCHEMA} />
      <section className="page-hero">
        <div className="wrap">
          <h1>Christmas Card Maker</h1>
          <p>
            A card with their name on it means ten times more than a forwarded image. Make one in
            under a minute — free, no sign-up, ready to share.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <CardMaker />
          <div className="prose mt-40">
            <h2>How to make a Christmas card — in five steps</h2>
            <ol className="steps-list">
              <li><strong>Pick a design</strong> — choose one of the festive designs above.</li>
              <li><strong>Who is it for?</strong> — type their name; it appears on the card itself.</li>
              <li>
                <strong>Write your message</strong> — your own words, or borrow one from our{" "}
                <a href="/wishes">Christmas wishes library</a>.
              </li>
              <li><strong>From</strong> — sign your name so they know who sent it.</li>
              <li>
                <strong>Download or share</strong> — save the finished card as a picture, or share
                it straight to WhatsApp or Facebook.
              </li>
            </ol>
            <p>
              Send it in a chat, post it, or print it out and slip it into an envelope the
              old-fashioned way. Every card carries a tiny “Made with MerryHub” note at the
              bottom — that's how your friends find their way here to make cards of their own.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
