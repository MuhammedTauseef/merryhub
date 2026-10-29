import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact Us",
  description: `Get in touch with the ${SITE_NAME} team — report a bug, suggest a wish category, or just say merry Christmas.`,
});

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Contact {SITE_NAME}</h1>
          <p>We read every message — bug reports, ideas and Christmas cheer all welcome.</p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap prose">
          <h2>Email us</h2>
          <p>
            The fastest way to reach us is email:{" "}
            <a href="mailto:muhammadtauseef714@gmail.com">muhammadtauseef714@gmail.com</a>
          </p>
          <p>It helps to tell us:</p>
          <ul>
            <li>Which page or tool you were using</li>
            <li>What you expected to happen, and what happened instead</li>
            <li>Your device and browser, if something looked broken</li>
          </ul>
          <h2>Suggest a wish</h2>
          <p>
            Missing a category in the wishes library — wishes for teachers, neighbours, a new
            baby's first Christmas? Send it over. The library grows every season, and the best
            additions come from readers.
          </p>
          <h2>Business enquiries</h2>
          <p>
            For partnerships or advertising questions, use the same email address with
            “MerryHub business” in the subject line so it lands in the right place.
          </p>
        </div>
      </section>
    </>
  );
}
