import JsonLd from "@/components/JsonLd";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * A visible FAQ section whose questions and answers are exactly the ones
 * emitted as FAQPage structured data — the schema never claims anything
 * the visitor cannot read on the page.
 */
export default function Faq({ items, heading = "Questions, answered" }: { items: FaqItem[]; heading?: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <section className="faq-section mt-40">
      <JsonLd data={schema} />
      <div className="prose">
        <h2>{heading}</h2>
      </div>
      <div className="faq-list">
        {items.map((item) => (
          <div className="faq-item" key={item.q}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
