/**
 * Editorial details for the individual product pages
 * (/printables/<slug>) — the facts the products table does not carry:
 * programme category, page count, type-in field count, what's inside,
 * who it is for, and the page's meta description.
 *
 * Every fact here comes from the product records (Whop registry,
 * Canva-rollout manifest, the plan files) or the site's own published
 * copy — nothing is invented, and prices never live here (they come
 * from the products table via lib/products, so an admin price edit
 * flows onto the product page automatically).
 *
 * The slug is derived from the product's display name; the mapping was
 * verified against the gallery folder names for all 20 launch
 * products (slugify(name) === gallery folder for every one).
 */

export interface ProductDetails {
  /** One of the storefront's programme categories. */
  category: string;
  /** Content pages in the delivered PDF (excluding the one
   *  "Edit in Canva" link page every paid file now carries). */
  pages: number;
  /** Type-in (fillable) fields in the PDF. 0 = print-and-play/decor. */
  fields: number;
  /** "What's included" bullets — facts only. */
  includes: string[];
  /** One line: who this product is for. */
  audience: string;
  /** Meta description for the product page (unique per product). */
  meta: string;
}

/** "Elf Notes & Letters Pack" → "elf-notes-letters-pack". */
export function productSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PRODUCT_DETAILS: Record<string, ProductDetails> = {
  "complete-christmas-bundle": {
    category: "Bundles",
    pages: 68,
    fields: 70,
    includes: [
      "12 printable greeting cards — one A4 sheet each, fold in half for an A5 card",
      "24 gift tags with To and From lines and light cut guides",
      "The Big Christmas Quiz — 12 questions plus the answer key with the story behind every answer",
      "11 printable party games (23 sheets): trivia, word search, emoji pictionary, word scramble, categories, finish-the-phrase, a carol quiz, 10 bingo cards with a caller sheet, the Left–Right gift game, the dice gift exchange and White Elephant rules",
      "A Secret Santa questionnaire sheet",
      "The Santa set: a letter from Santa, a letter to Santa, and a Nice List certificate",
      "The Elf Kit: an arrival letter, a goodbye letter, 24 daily elf note cards and an elf report card",
      "25 Advent activity cards — one no-cost family activity per day — plus make-your-own blanks",
      "8 table place cards with write-in name lines",
      "The Editable Premium edition inside the same download: 70 type-in fields for the names on the letters, certificate, tags and place cards",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience:
      "Families, teachers and party hosts who want the whole Christmas kit — games, elf, Advent, cards and tags — in one download.",
    meta: "The Complete Christmas Bundle: 68 printable pages — games, Elf Kit, Advent cards, greeting cards, gift tags and Santa letters. $7, instant PDF download.",
  },
  "christmas-games-bundle": {
    category: "Christmas Printables",
    pages: 25,
    fields: 0,
    includes: [
      "15 printable party games and the Big Christmas Quiz — 25 pages in total",
      "Christmas trivia, a word search with solution, emoji pictionary, word scramble, categories, finish-the-phrase and a carol quiz",
      "10 bingo cards with a caller sheet",
      "Party gift games: the Left–Right gift game, the dice gift exchange and White Elephant rules",
      "A Secret Santa questionnaire sheet",
      "Answer keys included — print, hand out pencils, and play",
    ],
    audience:
      "Party hosts, offices and classrooms that need a full night of Christmas games without any prep.",
    meta: "Printable Christmas Games Bundle: 15 party games plus the Big Christmas Quiz, 25 pages with answer keys. $4, instant PDF download.",
  },
  "elf-on-the-shelf-kit-advent-bundle": {
    category: "Christmas Printables",
    pages: 17,
    fields: 7,
    includes: [
      "Elf arrival letter — for the morning your elf appears",
      "Elf goodbye letter — for Christmas morning",
      "24 daily elf note cards (three sheets of eight)",
      "An official elf report card to colour in and keep",
      "25 Advent activity cards — one original, no-cost family activity for every day from 1 December to Christmas Day",
      "Make-your-own blank Advent cards",
      "7 type-in fields, so the letters carry your child's name and your elf's name",
    ],
    audience:
      "Parents running Elf on the Shelf who want the letters, notes and a month of Advent activities sorted in one pack.",
    meta: "Elf on the Shelf Kit + Advent Activity Cards Bundle: arrival and goodbye letters, 24 elf notes, report card and 25 Advent cards. $4, instant PDF download.",
  },
  "cards-gift-tags-santa-letters-bundle": {
    category: "Greeting Cards",
    pages: 24,
    fields: 63,
    includes: [
      "12 printable greeting cards — one A4 sheet each, fold in half for an A5 card",
      "24 gift tags with To and From lines and light cut guides",
      "A fill-in letter from Santa",
      "A letter to Santa for children to complete",
      "An official Nice List certificate with the North Pole seal",
      "63 type-in fields — type the names straight into the PDF before you print",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience:
      "Families who write, wrap and label everything at home — and want the names typed, not handwritten.",
    meta: "Christmas Cards, Gift Tags & Santa Letters Bundle: 12 cards, 24 tags, Santa letters and a Nice List certificate — editable, 63 type-in fields. $3, instant PDF download.",
  },
  "baby-shower-bundle": {
    category: "Baby Shower",
    pages: 34,
    fields: 24,
    includes: [
      "10 baby shower games, with answer keys",
      "Bingo cards for the gift-opening",
      "Gift tags",
      "A printable banner",
      "24 type-in fields for the name-it details",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Baby shower hosts who want the games, bingo, tags and banner handled in one pack.",
    meta: "Baby Shower Printable Bundle: 10 games with answer keys, bingo cards, gift tags and a banner — 34 pages. $4, instant PDF download.",
  },
  "adhd-friendly-planner": {
    category: "Planners",
    pages: 30,
    fields: 21,
    includes: [
      "Undated daily pages — start any day, skip a day, no wasted dated pages",
      "Undated weekly pages",
      "Reset pages for getting back on track",
      "21 type-in fields",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience:
      "Adults who want a gentle, undated planner. This is a planning tool — it is not medical advice.",
    meta: "ADHD-Friendly Planner for Adults: undated daily and weekly pages with reset pages, 30 pages, editable. $4, instant PDF download.",
  },
  "birthday-party-bundle": {
    category: "Birthday & Party",
    pages: 30,
    fields: 24,
    includes: [
      "Birthday party games",
      "Bingo cards",
      "Gift tags",
      "A printable banner",
      "24 type-in fields for the birthday details",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Birthday party hosts — for kids' parties and grown-up birthdays alike.",
    meta: "Birthday Party Printable Bundle: games, bingo cards, gift tags and a banner — 30 pages. $3, instant PDF download.",
  },
  "kids-puzzle-activity-pack": {
    category: "Kids Activities",
    pages: 30,
    fields: 0,
    includes: [
      "Word searches",
      "Mazes",
      "Sudoku puzzles",
      "Made for ages 6–12",
      "Print-and-play — no prep, just pencils",
    ],
    audience:
      "Parents, teachers and carers who need screen-free activities that keep kids busy at home, in class or on a trip.",
    meta: "Kids Puzzle & Activity Pack: word searches, mazes and sudoku for ages 6–12 — 30 printable pages. $3, instant PDF download.",
  },
  "2027-new-year-planner": {
    category: "Planners",
    pages: 23,
    fields: 332,
    includes: [
      "Goal pages for 2027",
      "Monthly pages",
      "January weekly pages to start the year",
      "A4 format",
      "332 type-in fields — fill it in on screen or print and write",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Anyone setting up 2027 on paper — goals first, then the months and weeks.",
    meta: "2027 New Year Planner: goals, monthly pages and January weeks, A4, with 332 type-in fields. $3, instant PDF download.",
  },
  "christmas-wall-art-set": {
    category: "Christmas Printables",
    pages: 7,
    fields: 0,
    includes: [
      "6 festive typography prints",
      "Sized 8×10 — print at home or at a print shop and frame",
      "Print-and-decorate: no editing, no fields",
    ],
    audience: "Anyone decorating a home, office or classroom wall for Christmas in minutes.",
    meta: "Christmas Wall Art Set: 6 printable festive typography prints, sized 8×10. $3, instant PDF download.",
  },
  "all-occasion-cards-tags": {
    category: "Greeting Cards",
    pages: 16,
    fields: 48,
    includes: [
      "12 printable cards for any occasion — birthdays, thank-yous and everything between",
      "24 gift tags",
      "48 type-in fields",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Year-round card senders who like a drawer-ready set for every occasion.",
    meta: "All-Occasion Printable Cards & Gift Tags: 12 cards and 24 tags for birthdays, thank-yous and more — editable. $2, instant PDF download.",
  },
  "planners-productivity-bundle": {
    category: "Planners",
    pages: 28,
    fields: 326,
    includes: [
      "Undated daily pages",
      "Undated weekly pages",
      "Habit tracker pages",
      "Goal pages",
      "326 type-in fields — type on screen or print and write",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Paper-planner people who want one undated set that works in any week of any year.",
    meta: "Planners & Productivity Bundle: undated daily, weekly, habit and goal pages — 28 A4 pages, 326 type-in fields. $4, instant PDF download.",
  },
  "christmas-gift-coupons": {
    category: "Christmas Printables",
    pages: 6,
    fields: 56,
    includes: [
      "16 ready-to-give printable gift coupons — favours and treats to promise in writing",
      "4 blank coupons to write your own",
      "56 type-in fields for names and coupon text",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Anyone filling stockings or cards with promises instead of more stuff.",
    meta: "Christmas Gift Coupons: 16 ready-to-give coupons plus 4 blanks — editable, 56 type-in fields. $2, instant PDF download.",
  },
  "home-organization-bundle": {
    category: "Home Organization",
    pages: 26,
    fields: 637,
    includes: [
      "Weekly meal planner pages in two styles, plus a meal ideas bank",
      "Grocery lists organised by store section",
      "Pantry and fridge inventory pages",
      "A cleaning schedule with room-by-room checklists",
      "A 30-day declutter challenge — one small job per day",
      "A donation tracker",
      "A chores rota for the whole household",
      "A home maintenance tracker and a laundry schedule",
      "A family command centre page",
      "637 type-in fields — run the whole binder from the PDF",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Households that want meals, cleaning, chores and clutter handled by one calm system.",
    meta: "Home Organization Bundle: meal planner, grocery lists, cleaning schedules, chores rota and a 30-day declutter challenge — 26 pages. $3, instant PDF download.",
  },
  "budget-finance-planner-bundle": {
    category: "Budget & Finance",
    pages: 28,
    fields: 724,
    includes: [
      "Monthly budget pages",
      "A bills tracker — what is due, when, and whether it is paid",
      "Savings pages for goals big and small",
      "Debt payoff pages",
      "724 type-in fields — the most type-in-friendly pack we make",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience:
      "Anyone who budgets better on paper. This is a planning and tracking tool — it is not financial advice.",
    meta: "Budget & Finance Planner Bundle: monthly budget, bills, savings and debt pages — 28 A4 pages, 724 type-in fields. $4, instant PDF download.",
  },
  "elf-notes-letters-pack": {
    category: "Christmas Printables",
    pages: 12,
    fields: 7,
    includes: [
      "Elf arrival letter",
      "Elf goodbye letter for Christmas morning",
      "24 elf notes — a fresh note for every day of the visit",
      "An official elf report card",
      "7 type-in fields for your child's name and your elf's name",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Elf on the Shelf parents who just need the letters and notes — the small pack, nothing extra.",
    meta: "Elf Notes & Letters Pack: arrival and goodbye letters, 24 elf notes and a report card — editable. $3, instant PDF download.",
  },
  "party-games-mini-pack": {
    category: "Christmas Printables",
    pages: 11,
    fields: 0,
    includes: [
      "10 printable party games",
      "Answer keys included",
      "Print-and-play — one small pack for one good night",
    ],
    audience: "Small parties and stocking-filler fun — the mini version of our games bundle.",
    meta: "Christmas Party Games Mini-Pack: 10 printable party games with answer keys — 11 pages. $3, instant PDF download.",
  },
  "advent-activity-cards": {
    category: "Christmas Printables",
    pages: 5,
    fields: 0,
    includes: [
      "25 Advent activity cards — one for every day from 1 December to Christmas Day",
      "Each card is an original, no-cost family activity",
      "Cut them out and draw one each morning, or hide them inside an Advent calendar",
    ],
    audience: "Families who count down with activities instead of (or as well as) chocolate.",
    meta: "Advent Activity Cards: 25 printable cards with a family activity for every day of December. $2, instant PDF download.",
  },
  "gift-tags-santa-letters-set": {
    category: "Greeting Cards",
    pages: 10,
    fields: 55,
    includes: [
      "24 gift tags with To and From lines",
      "A fill-in letter from Santa",
      "A letter to Santa for children to complete",
      "55 type-in fields — type the names before you print",
      "A link inside the PDF to a fully editable Canva version (a free Canva account works)",
    ],
    audience: "Families who need the tags and the Santa letters — without the full cards bundle.",
    meta: "Gift Tags & Santa Letters Set: 24 tags plus Santa letters — editable, 55 type-in fields. $2, instant PDF download.",
  },
  "christmas-quiz-night-pack": {
    category: "Christmas Printables",
    pages: 5,
    fields: 0,
    includes: [
      "The Big Christmas Quiz — player sheets",
      "Trivia rounds and a carols round",
      "Full answer keys for the quizmaster",
    ],
    audience: "Quiz-night hosts at home, in the office or in the classroom.",
    meta: "Christmas Quiz Night Pack: the big quiz, trivia and carols with full answer keys. $2, instant PDF download.",
  },
};

export function getProductDetails(slug: string): ProductDetails | undefined {
  return PRODUCT_DETAILS[slug];
}
