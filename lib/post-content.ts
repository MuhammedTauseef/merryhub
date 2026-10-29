import type { PostSection } from "@/lib/posts";

/**
 * The blog editor's content format — ONE plain-text field, deliberately
 * simple and hard to break:
 *
 *   ## Your H2 heading
 *   A paragraph of text. Blank line separates paragraphs.
 *   - A bullet point
 *   - Another bullet
 *
 *   ## Next heading
 *   More text…
 *
 * Lines before the first "##" are ignored (start your content with a
 * heading). parsePostContent() turns the text into the sections jsonb the
 * site stores; serializePostContent() turns stored sections back into the
 * text for editing. Both directions are lossless for well-formed input.
 */
export function parsePostContent(text: string): PostSection[] {
  const sections: PostSection[] = [];
  let current: PostSection | null = null;
  let paraLines: string[] = [];

  const flushParagraph = () => {
    if (current && paraLines.length > 0) {
      const para = paraLines.join(" ").trim();
      if (para) {
        current.paragraphs = [...(current.paragraphs ?? []), para];
      }
    }
    paraLines = [];
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushParagraph();
      current = { h2: line.slice(3).trim() };
      sections.push(current);
    } else if (!current) {
      continue; // preamble before the first heading is ignored
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      flushParagraph();
      const bullet = line.slice(2).trim();
      if (bullet) current.bullets = [...(current.bullets ?? []), bullet];
    } else if (line === "") {
      flushParagraph();
    } else {
      paraLines.push(line);
    }
  }
  flushParagraph();
  return sections.filter((s) => s.h2.length > 0);
}

export function serializePostContent(sections: PostSection[]): string {
  return sections
    .map((s) => {
      const parts: string[] = [`## ${s.h2}`];
      for (const p of s.paragraphs ?? []) parts.push("", p);
      if (s.bullets && s.bullets.length > 0) {
        parts.push("", ...s.bullets.map((b) => `- ${b}`));
      }
      return parts.join("\n");
    })
    .join("\n\n");
}
