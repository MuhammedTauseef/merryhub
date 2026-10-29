import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles your information: our tools run in your browser, we don't require accounts, and we explain analytics and advertising choices plainly.`,
});

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Privacy Policy</h1>
          <p>Plain words, no surprises. Last updated: October 2026.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>The short version</h2>
          <p>
            {SITE_NAME} is a collection of free festive tools. You don't need an account to use
            anything here, and the tools themselves — the card maker, the countdown, the elf
            name generator and the quiz — run entirely in your web browser. The names, messages
            and card designs you create are processed on your device and are not uploaded to us.
          </p>
          <h2>Information we collect</h2>
          <p>
            <strong>Tool data:</strong> none. What you type into the card maker or the elf name
            generator stays in your browser tab and disappears when you close it.
          </p>
          <p>
            <strong>Contact messages:</strong> if you email us, we receive your email address and
            the contents of your message so we can reply. We don't sell it or use it for
            marketing lists.
          </p>
          <p>
            <strong>Basic technical data:</strong> like almost every website, our hosting
            provider automatically processes standard request information (such as your IP
            address, browser type and the pages visited) to serve the site securely and measure
            overall traffic.
          </p>
          <h2>Cookies</h2>
          <p>
            The core tools do not set tracking cookies. If we add privacy-friendly analytics or
            advertising (for example, Google AdSense), those services may set cookies to
            measure visits or to personalise ads, and this policy will be updated before or
            when that happens. You can block or delete cookies in your browser settings at any
            time, and the site will still work. Our <a href="/cookies">Cookie Policy</a>{" "}
            explains this in full.
          </p>
          <h2>Advertising partners</h2>
          <p>
            When advertising is active on {SITE_NAME}, third-party vendors, including Google,
            use cookies to serve ads based on a visitor's prior visits to this website or
            other websites. Google's use of advertising cookies enables it and its partners
            to serve ads to our visitors based on their visits to this site and/or other
            sites on the Internet. You may opt out of personalised advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads">Google Ads Settings</a>, and you
            can opt out of some third-party vendors' personalised-advertising cookies at{" "}
            <a href="https://www.aboutads.info/choices/">aboutads.info/choices</a>.
          </p>
          <h2>Third-party links and sharing</h2>
          <p>
            Share buttons open the sharing services you choose (such as WhatsApp or Facebook).
            Once you leave {SITE_NAME}, the privacy policy of that service applies to anything
            you post there.
          </p>
          <h2>Children</h2>
          <p>
            The site is designed to be family-friendly. We do not knowingly collect personal
            information from children, and no part of the site asks children to submit any.
          </p>
          <h2>Changes and contact</h2>
          <p>
            If this policy changes, the new version will be posted on this page with an updated
            date. Questions about privacy are welcome — see the{" "}
            <a href="/contact">contact page</a>.
          </p>
        </div>
      </section>
    </>
  );
}
