/* Logic verification for MerryHub: countdown math, elf names, card drawing. */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "merryhub-verify-"));

execFileSync(
  "npx",
  [
    "tsc",
    "lib/dates.ts",
    "lib/elfNames.ts",
    "lib/site.ts",
    "lib/cardDesigns.ts",
    "--module",
    "commonjs",
    "--target",
    "es2022",
    "--moduleResolution",
    "node",
    "--skipLibCheck",
    "--outDir",
    outDir,
  ],
  { cwd: root, stdio: "inherit" },
);

const require = createRequire(import.meta.url);
const dates = require(path.join(outDir, "dates.js"));
const elf = require(path.join(outDir, "elfNames.js"));
const cards = require(path.join(outDir, "cardDesigns.js"));

let failures = 0;
const check = (label, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) failures++;
};

/* ---------- countdown ---------- */
const p1 = dates.getCountdownParts(new Date(2026, 9, 28, 21, 53, 0));
check(`Oct 28 21:53 -> 57 days (got ${p1.days})`, p1.days === 57);
check(`Oct 28 21:53 -> 2 hours (got ${p1.hours})`, p1.hours === 2);
check("Oct 28 -> not Christmas Day", p1.isChristmasDay === false);
check("Target year 2026", p1.christmasYear === 2026);

const p2 = dates.getCountdownParts(new Date(2026, 11, 24, 0, 0, 0));
check(`Dec 24 00:00 -> exactly 1 day (got ${p2.days})`, p2.days === 1);

const p3 = dates.getCountdownParts(new Date(2026, 11, 25, 10, 30, 0));
check("Dec 25 -> isChristmasDay", p3.isChristmasDay === true);
check("Dec 25 -> 0 days", p3.days === 0);

const p4 = dates.getCountdownParts(new Date(2026, 11, 26, 0, 0, 1));
check("Dec 26 -> counts to 2027", p4.christmasYear === 2027);
check(`Dec 26 00:00:01 -> 363 full days (got ${p4.days})`, p4.days === 363);

const live = dates.getCountdownParts();
console.log(
  `INFO  live now: ${live.days}d ${live.hours}h ${live.minutes}m ${live.seconds}s until Christmas ${live.christmasYear}`,
);

/* ---------- elf name generator ---------- */
const e1 = elf.elfNameFor("Tauseef", "December");
const e2 = elf.elfNameFor("Tauseef", "December");
check(`Elf name deterministic (${e1.full})`, e1.full === e2.full && e1.full.split(" ").length === 2);
check("Elf first name from A = Twinkle", elf.elfNameFor("Aisha", "January").first === "Twinkle");
check(
  "Elf surname uses birth month (January -> Snow...)",
  elf.elfNameFor("Aisha", "January").last.startsWith("Snow"),
);
check(
  "Elf surname uses birth month (December -> Jingle...)",
  elf.elfNameFor("Bilal", "December").last.startsWith("Jingle"),
);
check(
  "Different initials give different elf names",
  elf.elfNameFor("Aisha", "May").first !== elf.elfNameFor("Bilal", "May").first,
);
check("Elf job assigned", typeof elf.elfJobFor(e1.full) === "string" && elf.elfJobFor(e1.full).length > 3);

/* ---------- card designs (stub canvas ctx) ---------- */
function stubCtx() {
  const gradient = { addColorStop() {} };
  const target = {
    canvas: { width: 1200, height: 800 },
    measureText: (t) => ({ width: String(t).length * 18 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      return () => {};
    },
    set(obj, prop, value) {
      obj[prop] = value;
      return true;
    },
  });
}

for (const design of cards.CARD_DESIGNS) {
  for (const [w, h] of [
    [1200, 800],
    [300, 200],
  ]) {
    let ok = true;
    try {
      cards.drawCard(
        stubCtx(),
        design,
        { to: "Grandma Rose", message: "Wishing you a Christmas filled with warmth, laughter, love and very long afternoon naps by the fire.", from: "Tauseef" },
        w,
        h,
        "merryhub.vercel.app",
      );
    } catch (e) {
      ok = false;
      console.log(`  error in ${design.id} @${w}x${h}: ${e.message}`);
    }
    check(`Card design "${design.id}" draws at ${w}x${h}`, ok);
  }
}
check("Six card designs exist", cards.CARD_DESIGNS.length === 6);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
