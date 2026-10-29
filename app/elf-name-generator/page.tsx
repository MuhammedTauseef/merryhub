import type { Metadata } from "next";
import ElfNameGenerator from "@/components/ElfNameGenerator";
import Faq from "@/components/Faq";
import { ELF_FAQS } from "@/lib/faqs";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/elf-name-generator",
  title: "Elf Name Generator — What's Your Elf Name?",
  description:
    "Find your official North Pole elf name from your name and birth month — free, instant and silly. Share it with friends and compare jobs at Santa's workshop.",
  ogDescription: "Type your name, pick your birth month, meet your elf self. Free and instant.",
});

export default function ElfNameGeneratorPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Elf Name Generator</h1>
          <p>
            Everyone has a North Pole alter ego. Yours is one name and one birth month away —
            complete with an official workshop job title.
          </p>
        </div>
      </section>
      <section className="page-body">
        <div className="wrap">
          <ElfNameGenerator />
          <div className="prose mt-40">
            <h2>How elf names work here</h2>
            <p>
              Your elf first name comes from the first letter of your name, your elf surname is
              built from your birth month and the last letter of your name — so your elf name is
              truly <em>yours</em>: the same details always produce the same elf. Try your whole
              family, your class or your office and compare job titles — someone has to be Chief
              Snowflake Counter.
            </p>
            <h2>Things to do with your elf name</h2>
            <p>
              Use it on place cards at the Christmas table, sign your cards with it, label gift
              tags “from your favourite elf”, or make it the theme of this year's family photo.
              Share your result and challenge your friends to find theirs — the elves insist.
            </p>
          </div>
          <Faq items={ELF_FAQS} heading="Elf name questions" />
        </div>
      </section>
    </>
  );
}
