import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/disclaimer",
  title: "Disclaimer",
  description: `The ${SITE_NAME} disclaimer: our content is for festive fun and general information, printing results vary, and how advertising and external links work here.`,
});

export default function DisclaimerPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Disclaimer</h1>
          <p>Plain words, no surprises. Last updated: October 2026.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>For fun and general information</h2>
          <p>
            Everything on {SITE_NAME} — wishes, games, quizzes, guides and tools — is
            published for festive enjoyment and general information. It is not professional
            advice of any kind, and we can't promise that any particular page will suit
            every family's celebration.
          </p>
          <h2>Accuracy</h2>
          <p>
            We write and check our content with care, and our wishes, questions and games
            are original to this site. Even so, mistakes can slip through and facts (such
            as public event dates) can change; if you spot an error, please tell us via the{" "}
            <a href="/contact">contact page</a> and we will fix it.
          </p>
          <h2>Printing results</h2>
          <p>
            Our printable files are standard PDFs designed for ordinary home printers on A4
            or US Letter paper. Colours and alignment vary between printers and screens, so
            printed results may differ slightly from what you see on your device. Print one
            test page first when it matters.
          </p>
          <h2>Advertising and purchases</h2>
          <p>
            {SITE_NAME} may show advertising (for example, Google AdSense) to help keep the
            free tools free; ads are served by the advertising provider, and we don't
            control or endorse the products in individual ads. Our own printable pack is
            sold through our checkout provider; prices are shown in US dollars and the
            pack is licensed for personal use under our <a href="/terms">Terms of Use</a>.
          </p>
          <h2>External links</h2>
          <p>
            Links to other websites (including share buttons and our checkout) leave{" "}
            {SITE_NAME}; we are not responsible for the content, accuracy or privacy
            practices of those sites. Their own terms and policies apply once you leave.
          </p>
        </div>
      </section>
    </>
  );
}
