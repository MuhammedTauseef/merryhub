import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About Us",
  description: `About ${SITE_NAME} — a small, free Christmas website with a shareable card maker, original wishes in three languages, an elf name generator, a printable quiz and a live countdown.`,
});

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>About {SITE_NAME}</h1>
          <p>A small website with one big job: making Christmas a little merrier.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>Why we built this</h2>
          <p>
            Every December, the same lovely problems come back: How many days are left? What do I
            write in this card? What on earth is my elf name? {SITE_NAME} answers all of them in
            one cosy place — quickly, for free, and without asking you to sign up for anything.
          </p>
          <h2>What you'll find here</h2>
          <p>
            A <strong>card maker</strong> right on the homepage that turns your words into a
            beautiful picture you can download and share anywhere; a library of{" "}
            <strong>original Christmas wishes</strong> written by us for family, friends, bosses,
            clients, teachers, partners and kids — in English, Spanish and Portuguese;
            an <strong>elf name generator</strong>; a <strong>printable Christmas quiz</strong>;
            and a live <strong>countdown</strong> in the bar at the top of every page, ticking
            down to the big day.
          </p>
          <h2>How we think about your time (and your data)</h2>
          <p>
            Everything on {SITE_NAME} runs in your browser. The card maker draws your card on
            your own device, the elf name generator works it out on your phone, and we don't ask
            for accounts, emails or personal details to use any of it. Simple tools, honest fun —
            that's the whole idea.
          </p>
          <h2>Say hello</h2>
          <p>
            Found a wish you loved, a bug we should fix, or an idea for next Christmas? We'd
            genuinely love to hear it — visit the <a href="/contact">contact page</a> and get in
            touch.
          </p>
        </div>
      </section>
    </>
  );
}
