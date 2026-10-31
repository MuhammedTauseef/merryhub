import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Use",
  description: `The terms for using ${SITE_NAME}: free festive tools and wishes for personal use, printable pack licences, and the plain rules of the site.`,
});

export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Terms of Use</h1>
          <p>Plain words, no surprises. Last updated: October 2026.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>Using this site</h2>
          <p>
            {SITE_NAME} offers free Christmas tools — a card maker, a wishes library, an elf
            name generator, a quiz, a countdown and printable activities. By using the site
            you agree to these terms. Everything is provided for personal, non-commercial
            enjoyment unless a licence below says otherwise.
          </p>
          <h2>The free tools and wishes</h2>
          <p>
            Cards you create with the card maker are yours to download, print and share with
            family and friends. The wishes in our library may be copied into your own cards
            and messages for personal use. Please do not republish our collections wholesale
            on another website or product.
          </p>
          <h2>The printable pack</h2>
          <p>
            The free sample may be printed as many times as you like for your own household,
            classroom or party. The paid full pack and the Editable Premium edition are
            licensed to the buyer for personal use: print as many copies as your Christmas
            needs, but please do not share, resell, upload or redistribute the files
            themselves — send friends to {SITE_NAME} instead so they can get their own copy.
          </p>
          <h2>Digital downloads and payments</h2>
          <p>
            The printable packs are digital products: no physical item is shipped.
            Payments are processed by Whop, and Whop's own terms apply to the
            transaction. Right after checkout, Whop delivers the PDF as a download,
            and the file also stays in your Whop library so you can download it
            again. Files are PDFs made for home printing on A4 or US Letter paper.
            Each product page shows photos of the real pages and a full list of
            what is inside, so you can check exactly what you are buying before
            you pay.
          </p>
          <h2>Our content</h2>
          <p>
            The text, designs, artwork and layout on {SITE_NAME} belong to {SITE_NAME} or its
            creators and are protected by copyright. The wishes, games, quizzes and letters
            published here are original works written for this site.
          </p>
          <h2>Fair use of the site</h2>
          <p>
            Please don't misuse the site: no automated scraping that burdens the service, no
            attempts to access the admin area without authorisation, and no use of the tools
            to create unlawful or harmful material.
          </p>
          <h2>Availability and liability</h2>
          <p>
            We work hard to keep {SITE_NAME} online and accurate, but the site is provided
            "as is" without warranties. Printing results depend on your printer and paper,
            and countdown dates are shown in good faith. To the extent the law allows, we
            are not liable for indirect losses arising from use of the site or its files.
          </p>
          <h2>Changes and contact</h2>
          <p>
            These terms may be updated; the current version always lives on this page with
            its date. Questions are welcome — see the <a href="/contact">contact page</a>.
            Privacy is covered by our <a href="/privacy">Privacy Policy</a> and{" "}
            <a href="/cookies">Cookie Policy</a>.
          </p>
        </div>
      </section>
    </>
  );
}
