import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-body">
      <div className="wrap center">
        <div style={{ fontSize: "3.4rem" }} aria-hidden="true">
          🎄
        </div>
        <h1>This page got lost in the snow</h1>
        <p className="hint" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
          The page you're looking for isn't here — but the countdown is still ticking and the
          card maker is warm and ready.
        </p>
        <div className="hero-cta">
          <Link href="/" className="btn btn-red">
            Back to MerryHub
          </Link>
          <Link href="/card-maker" className="btn btn-outline-dark">
            Make a card
          </Link>
        </div>
      </div>
    </section>
  );
}
