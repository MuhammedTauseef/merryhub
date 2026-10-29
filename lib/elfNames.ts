/**
 * Elf Name Generator: first name + birth month -> a funny elf name.
 * Deterministic: the same person always gets the same elf name.
 */

const FIRST_BY_LETTER: Record<string, string> = {
  A: "Twinkle", B: "Bubbles", C: "Cocoa", D: "Dazzle", E: "Ember", F: "Figgy",
  G: "Glitter", H: "Holly", I: "Icicle", J: "Jingle", K: "Kringle", L: "Lollipop",
  M: "Merry", N: "Noelle", O: "Olive", P: "Peppermint", Q: "Quill", R: "Ribbon",
  S: "Snowdrop", T: "Tinsel", U: "Ulf", V: "Velvet", W: "Waffle", X: "Xavi",
  Y: "Yule", Z: "Zippy",
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const MONTH_WORD: Record<string, string> = {
  January: "Snow", February: "Heart", March: "Clover", April: "Puddle",
  May: "Bloom", June: "Sunny", July: "Sparkler", August: "Harvest",
  September: "Maple", October: "Pumpkin", November: "Frosty", December: "Jingle",
};

function surnameSuffix(lastLetter: string): string {
  if ("aeiouy".includes(lastLetter)) return "sparkles";
  if ("bcdfg".includes(lastLetter)) return "bottoms";
  if ("hjklm".includes(lastLetter)) return "mittens";
  if ("npqrs".includes(lastLetter)) return "toes";
  return "beard";
}

export interface ElfName {
  first: string;
  last: string;
  full: string;
}

export function elfNameFor(name: string, birthMonth: string): ElfName {
  const clean = name.trim();
  const firstLetter = (clean.charAt(0) || "M").toUpperCase();
  const lastLetter = (clean.charAt(clean.length - 1) || "s").toLowerCase();
  const first = FIRST_BY_LETTER[firstLetter] ?? "Merry";
  const monthWord = MONTH_WORD[birthMonth] ?? "Jingle";
  const last = `${monthWord}${surnameSuffix(lastLetter)}`;
  return { first, last, full: `${first} ${last}` };
}

const ELF_JOBS = [
  "Chief Toy Tester, North Pole",
  "Head of Reindeer Snacks",
  "Senior Ribbon Curler",
  "Official Cookie Quality Inspector",
  "Sleigh Parking Attendant (First Class)",
  "Chief Snowflake Counter",
  "Head Gift Wrapper, Emergency Division",
  "Reindeer Games Referee",
  "Cocoa Warmer-in-Chief",
  "Naughty-or-Nice List Proofreader",
];

export function elfJobFor(elfFullName: string): string {
  let hash = 0;
  for (let i = 0; i < elfFullName.length; i++) {
    hash = (hash * 31 + elfFullName.charCodeAt(i)) >>> 0;
  }
  return ELF_JOBS[hash % ELF_JOBS.length];
}
