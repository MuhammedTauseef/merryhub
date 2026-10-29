import type { Metadata } from "next";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import Faq, { type FaqItem } from "@/components/Faq";
import Snowfall from "@/components/Snowfall";
import { getCountdownParts, longDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/countdown",
  title: "Christmas Countdown 2026 — Days Until Christmas",
  description:
    "Live Christmas countdown: how many days, hours, minutes and seconds until Christmas Day, 25 December 2026. Plus Christmas Eve, Boxing Day and New Year dates.",
  ogDescription:
    "Watch the live countdown to Christmas Day — days, hours, minutes and seconds to go.",
});

export default function CountdownPage() {
  const parts = getCountdownParts();
  const y = parts.christmasYear;
  const eve = new Date(y, 11, 24);
  const boxing = new Date(y, 11, 26);
  const newYear = new Date(y + 1, 0, 1);
  const weeks = Math.floor(parts.days / 7);
  const sleeps = parts.isChristmasDay ? 0 : parts.days;

  const faqs: FaqItem[] = [
    {
      q: `When is Christmas Day ${y}?`,
      a: `Christmas Day ${y} is ${longDate(parts.target)} — the countdown on this page runs to the very start of that day, midnight local time.`,
    },
    {
      q: "How many days are there until Christmas?",
      a: parts.isChristmasDay
        ? "None — today is Christmas Day. Merry Christmas!"
        : `There are ${parts.days} days until Christmas Day (${longDate(parts.target)}). The live timer at the top of this page counts the exact days, hours, minutes and seconds in real time.`,
    },
    {
      q: "How many sleeps are there until Christmas?",
      a: parts.isChristmasDay
        ? "No more sleeps — Christmas is here!"
        : `${sleeps} sleeps. Children count the nights rather than the days, and each sleep is one night closer to Christmas morning.`,
    },
    {
      q: `When are Christmas Eve and Boxing Day ${y}?`,
      a: `Christmas Eve is ${longDate(eve)} and Boxing Day is ${longDate(boxing)}. New Year's Day follows one week after Christmas, on ${longDate(newYear)}.`,
    },
  ];

  return (
    <>
      <section className="page-hero">
        <Snowfall density={60} />
        <div className="wrap hero-content">
          <h1>Christmas Countdown {y}</h1>
          <p>How many days until Christmas? The live answer, ticking down by the second:</p>
          <div style={{ marginTop: 26 }}>
            <CountdownTimer initial={parts} variant="page" />
          </div>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          <div className="prose">
            <h2>How many days until Christmas?</h2>
            <p>
              {parts.isChristmasDay ? (
                <>None at all — <strong>today is Christmas Day!</strong> Merry Christmas!</>
              ) : (
                <>
                  There are <strong>{parts.days} days</strong> until Christmas Day — that is{" "}
                  {weeks} full week{weeks === 1 ? "" : "s"} and {parts.days % 7} more day
                  {parts.days % 7 === 1 ? "" : "s"}, or{" "}
                  <strong>{sleeps} sleeps</strong> to go. Christmas Day {y} falls on{" "}
                  <strong>{longDate(parts.target)}</strong>, and the countdown above counts down
                  to the very start of that day, midnight local time.
                </>
              )}
            </p>
            <h2>Key dates for the festive season</h2>
            <p>
              Christmas is more than one day. Here are the dates everyone asks about, so you can
              plan the food, the travels and the time off:
            </p>
          </div>

          <div className="fact-grid">
            <div className="fact-card">
              <span className="fact-big">{longDate(eve)}</span>
              <p>
                <strong>Christmas Eve</strong> — the night Santa sets off. Stockings up, carrots
                out for the reindeer.
              </p>
            </div>
            <div className="fact-card">
              <span className="fact-big">{longDate(parts.target)}</span>
              <p>
                <strong>Christmas Day</strong> — the big day itself. Presents, feasting and the
                people you love most.
              </p>
            </div>
            <div className="fact-card">
              <span className="fact-big">{longDate(boxing)}</span>
              <p>
                <strong>Boxing Day</strong> — leftovers, long walks, sales and a slower pace across
                the UK, Canada, Australia and beyond.
              </p>
            </div>
            <div className="fact-card">
              <span className="fact-big">{longDate(newYear)}</span>
              <p>
                <strong>New Year's Day</strong> — one week after Christmas, the festive season
                rolls straight into a brand new year.
              </p>
            </div>
          </div>

          <Faq items={faqs} heading="Countdown questions, answered" />

          <div className="prose mt-40">
            <h2>Make the wait more fun</h2>
            <p>
              Counting down is only half the fun. While the clock ticks, why not{" "}
              <Link href="/card-maker">make a Christmas card</Link> for someone who would love to
              hear from you, find the perfect words in our{" "}
              <Link href="/wishes">Christmas wishes library</Link>, or discover your{" "}
              <Link href="/elf-name-generator">elf name</Link> and challenge the whole family to
              find theirs? The days fly by faster when you are spreading joy.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
