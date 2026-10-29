import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/cookies",
  title: "Cookie Policy",
  description: `How ${SITE_NAME} uses cookies: the free tools set no tracking cookies today, and how advertising cookies (Google AdSense) and your opt-out choices work.`,
});

export default function CookiesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Cookie Policy</h1>
          <p>Plain words, no surprises. Last updated: October 2026.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>What cookies are</h2>
          <p>
            Cookies are small text files a website stores in your browser. They can be
            essential (a site needs them to work), functional (remembering choices), or
            used for analytics and advertising.
          </p>
          <h2>What {SITE_NAME} sets today</h2>
          <p>
            The public site sets <strong>no tracking cookies</strong>. The card maker, elf
            name generator, quiz and wishes all run in your browser without accounts, and
            what you type stays in your tab. The only sign-in on the site is the private
            admin area used by the site's owner, which keeps its own session in browser
            storage; visitors never touch it.
          </p>
          <h2>Advertising cookies</h2>
          <p>
            {SITE_NAME} may use Google AdSense to show ads that help keep the free tools
            free. When ads are active:
          </p>
          <ul>
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on a
              visitor's prior visits to this website or other websites.
            </li>
            <li>
              Google's use of advertising cookies enables it and its partners to serve ads
              to our visitors based on their visits to this site and/or other sites on the
              Internet.
            </li>
            <li>
              You may opt out of personalised advertising by visiting Google's Ads
              Settings: <a href="https://www.google.com/settings/ads">google.com/settings/ads</a>.
              You can also opt out of some third-party vendors' use of cookies for
              personalised advertising at{" "}
              <a href="https://www.aboutads.info/choices/">aboutads.info/choices</a>.
            </li>
          </ul>
          <p>
            If other advertising or analytics services are added, this page and our{" "}
            <a href="/privacy">Privacy Policy</a> will be updated before or when that
            happens.
          </p>
          <h2>Your controls</h2>
          <p>
            Every modern browser lets you block, clear or limit cookies in its settings.
            Blocking cookies will not break {SITE_NAME}'s tools — the card maker, quizzes
            and downloads all work without them.
          </p>
        </div>
      </section>
    </>
  );
}
