import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import PrintButton from "@/components/PrintButton";
import { QUIZ_FAQS } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/christmas-quiz",
  title: "The Big Christmas Quiz — Printable, with Answers",
  description:
    "A free printable Christmas quiz: 12 festive questions with an answer key. Play it on screen, or print it for the Christmas table, classroom or office party.",
  ogTitle: "The Big Christmas Quiz — Printable, with Answer Key",
  ogDescription:
    "Twelve Christmas questions, one winner. Play online or print it for the table — answers included for the quizmaster.",
});

export default function ChristmasQuizPage() {
  const shareTitle = "The Big Christmas Quiz — Printable, with Answers";
  const shareUrl = `${SITE_URL}/christmas-quiz`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  return (
    <>
      <section className="page-hero no-print">
        <div className="wrap">
          <h1>The Big Christmas Quiz</h1>
          <p>
            Twelve questions, zero mercy for the person who “doesn't really watch Christmas
            films”. Play on screen — tap to reveal each answer — or print the whole quiz for the
            table.
          </p>
          <div className="hero-cta">
            <PrintButton label="🖨 Print the quiz / Save as PDF" />
          </div>
        </div>
      </section>

      <section className="page-body">
        <div className="wrap">
          <div className="print-title print-only">
            <div className="print-h1">🎄 The MerryHub Christmas Quiz 🎄</div>
            <p>Name: ______________________________ &nbsp;&nbsp; Score: ______ / {QUIZ_QUESTIONS.length}</p>
          </div>

          <div className="prose no-print" style={{ marginBottom: 26 }}>
            <p>
              <strong>How to play:</strong> read each question aloud, teams write their answers
              down, then reveal and award a point per correct answer. On paper, write in the
              spaces provided — the quizmaster's answer key prints at the end. Good luck, and no
              searching the answers on your phone (Santa is watching).
            </p>
          </div>

          <div className="quiz-list">
            {QUIZ_QUESTIONS.map((q, i) => (
              <article className="quiz-card" key={i}>
                <h3>
                  <span className="quiz-num">{i + 1}.</span> {q.question}
                </h3>
                <div className="answer-line print-only" aria-hidden="true" />
                <details className="quiz-answer no-print">
                  <summary>Show answer</summary>
                  <p>
                    <strong>{q.answer}.</strong> {q.fact}
                  </p>
                </details>
              </article>
            ))}
          </div>

          <section className="print-only answer-key">
            <h2>Answer key (quizmaster only!)</h2>
            <ol>
              {QUIZ_QUESTIONS.map((q, i) => (
                <li key={i}>
                  <strong>{q.answer}</strong> — {q.question}
                </li>
              ))}
            </ol>
            <p>Made with MerryHub — merryhub.vercel.app</p>
          </section>

          <div className="no-print">
            <Faq items={QUIZ_FAQS} heading="Quiz questions, answered" />
          </div>

          <div className="prose mt-40 no-print center">
            <h2>More Christmas fun</h2>
            <p>
              Crown the quiz champion with a personalised{" "}
              <Link href="/card-maker">Christmas card</Link>, find out everyone's{" "}
              <Link href="/elf-name-generator">elf name</Link> for next year's teams, or browse{" "}
              <Link href="/wishes">Christmas wishes</Link> for the card you still haven't written.
            </p>
          </div>

          <div className="prose mt-40 no-print center">
            <h2>Share the quiz</h2>
            <div className="share-row">
              <a className="share-btn share-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                Share on WhatsApp
              </a>
              <a className="share-btn share-facebook" href={facebookHref} target="_blank" rel="noopener noreferrer">
                Share on Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
