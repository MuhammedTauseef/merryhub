"use client";

import { useState } from "react";
import { MONTHS, elfJobFor, elfNameFor, type ElfName } from "@/lib/elfNames";
import { SITE_NAME } from "@/lib/site";

export default function ElfNameGenerator() {
  const [name, setName] = useState("");
  const [month, setMonth] = useState<string>("December");
  const [result, setResult] = useState<(ElfName & { job: string }) | null>(null);
  const [notice, setNotice] = useState("");

  const generate = () => {
    const clean = name.trim();
    if (!clean) {
      setNotice("Tell us your first name first — the elves need to know who they're naming!");
      return;
    }
    const elf = elfNameFor(clean, month);
    setResult({ ...elf, job: elfJobFor(elf.full) });
    setNotice("");
  };

  const shareText = result
    ? `🧝 My elf name is ${result.full} — ${result.job}! Find your Christmas elf name free on ${SITE_NAME}:`
    : "";
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/elf-name-generator` : "";

  const share = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Elf Name", text: `${shareText} ${shareUrl}` });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setNotice("Copied! Paste it anywhere to share your elf name.");
    } catch {
      setNotice(`${shareText} ${shareUrl}`);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 620, margin: "0 auto" }}>
      <div className="field">
        <label htmlFor="elf-name">Your first name</label>
        <input
          id="elf-name"
          type="text"
          maxLength={30}
          placeholder="e.g. Aisha"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              generate();
            }
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="elf-month">Your birth month</label>
        <select id="elf-month" value={month} onChange={(e) => setMonth(e.target.value)}>
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <button type="button" className="btn btn-red" style={{ width: "100%" }} onClick={generate}>
        🧝 Reveal my elf name
      </button>
      {notice && (
        <p className="placeholder-note mt-24" role="status">
          {notice}
        </p>
      )}
      {result && (
        <div className="reveal-box" aria-live="polite">
          <p>✨ Your official North Pole name is…</p>
          <p className="reveal-name">{result.full}</p>
          <p className="hint">
            Position: <strong>{result.job}</strong>
          </p>
          <div className="share-row">
            <button type="button" className="share-btn share-copy" onClick={share}>
              📤 Share my elf name
            </button>
            <a
              className="share-btn share-whatsapp"
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
          <p className="hint mt-24">
            The same name and birth month always give the same elf name — it's science. (It's
            not science.)
          </p>
        </div>
      )}
    </div>
  );
}
