import { cache } from "react";
import { getAnonSupabase } from "@/lib/supabase";

/**
 * The MerryHub storefront's product data layer. Products live in the
 * Supabase `products` table (see supabase/products-table.sql) and are
 * managed from the /admin panel — editing in admin goes live on
 * /printables with NO redeploy (the page is force-dynamic, like the blog).
 *
 * SAFE FALLBACK: if Supabase is not configured, the query fails, or the
 * table is empty, /printables renders FALLBACK_GROUPS — the exact static
 * content the page shipped with — so the storefront can never go blank.
 *
 * A row in `products` is the WEBSITE's record of a product (name, price,
 * Whop link, blurb, group, visibility). The sale itself always happens on
 * Whop; deleting a row here removes the card from this website only.
 */

/** One product card, in the exact shape /printables renders. */
export interface PrintableProduct {
  name: string;
  /** Display price, e.g. "$7". */
  price: string;
  /** Canonical Whop product URL (the card's Buy link). */
  href: string;
  /** The card's one-line description. */
  text: string;
}

/** One storefront section on /printables. */
export interface PrintableGroup {
  title: string;
  intro: string;
  products: PrintableProduct[];
}

/** The three storefront sections, in display order, with their intros.
 *  Products name one of these titles in their group_name — the admin
 *  form offers exactly these three, so a product can never be orphaned
 *  into a section the page does not render. */
export const PRODUCT_GROUP_META: { title: string; intro: string }[] = [
  {
    title: "Christmas Bundles",
    intro: "Start here: the complete bundle, then the Christmas bundles for games, elves and cards.",
  },
  {
    title: "All-Year Printables",
    intro: "Printables for birthdays, babies, planners and everyday occasions — not just Christmas.",
  },
  {
    title: "Small Packs — $2–$3",
    intro: "Smaller packs for one job: elf notes, party games, Advent and quiz night.",
  },
];

/** 700 → "$7"; 750 → "$7.50". */
export function formatPrice(priceCents: number): string {
  const dollars = priceCents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 20 → "Twenty"; 21 → "Twenty-one". Falls back to the digits past 99.
 *  Used for the /printables intro ("Twenty printable packs, …"). */
export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  const rest = n % 10;
  return rest === 0 ? TENS[Math.floor(n / 10)] : `${TENS[Math.floor(n / 10)]}-${ONES[rest].toLowerCase()}`;
}

/**
 * The exact content /printables shipped with before the products table
 * existed — names, prices, Whop links, blurbs, groups and order all
 * cross-checked against hidden_files/whop-products-live.md. Rendered
 * verbatim whenever the database read is unavailable or empty.
 */
export const FALLBACK_GROUPS: PrintableGroup[] = [
  {
    title: "Christmas Bundles",
    intro: "Start here: the complete bundle, then the Christmas bundles for games, elves and cards.",
    products: [
      {
        name: "Complete Christmas Bundle",
        price: "$7",
        href: "https://whop.com/merryhub/merryhub-christmas-printable-pack-editable-print-and-play-55-pages-editab/",
        text: "★ Featured bundle — 68 pages: games, elf kit, Advent cards, cards, gift tags and Santa letters.",
      },
      {
        name: "Christmas Games Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/christmas-games-bundle-15-printable-party-games-quiz-25-pages/",
        text: "15 printable party games and a quiz, 25 pages in total.",
      },
      {
        name: "Elf on the Shelf Kit + Advent Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/elf-on-the-shelf-kit-advent-activity-cards-bundle-printable-editable/",
        text: "The full elf kit plus 25 Advent activity cards.",
      },
      {
        name: "Cards, Gift Tags & Santa Letters Bundle",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-cards-gift-tags-santa-letters-bundle-printable-editable/",
        text: "Printable Christmas cards, gift tags and Santa letters.",
      },
    ],
  },
  {
    title: "All-Year Printables",
    intro: "Printables for birthdays, babies, planners and everyday occasions — not just Christmas.",
    products: [
      {
        name: "Baby Shower Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/products/baby-shower-printable-bundle-10-games-bingo-cards-tags-banner/",
        text: "10 games, bingo cards, tags and a banner for a baby shower.",
      },
      {
        name: "ADHD-Friendly Planner",
        price: "$4",
        href: "https://whop.com/merryhub/products/adhd-friendly-planner-for-adults-undated-printable-daily-weekly-reset/",
        text: "Undated daily and weekly planner with reset pages for adults.",
      },
      {
        name: "Birthday Party Bundle",
        price: "$3",
        href: "https://whop.com/merryhub/products/birthday-party-printable-bundle-games-bingo-cards-tags-banner/",
        text: "Games, bingo cards, tags and a banner for a birthday party.",
      },
      {
        name: "Kids Puzzle & Activity Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/kids-puzzle-activity-pack-printable-word-search-mazes-sudoku-ages-6-12/",
        text: "Word searches, mazes and sudoku for ages 6–12.",
      },
      {
        name: "2027 New Year Planner",
        price: "$3",
        href: "https://whop.com/merryhub/products/2027-new-year-planner-printable-goals-monthly-pages-january-weeks-a4/",
        text: "Goals, monthly pages and January weeks for 2027, A4.",
      },
      {
        name: "Christmas Wall Art Set",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-wall-art-set-of-6-prints-printable-8x10-festive-typography-decor/",
        text: "Set of 6 festive typography prints, 8×10.",
      },
      {
        name: "All-Occasion Cards & Tags",
        price: "$2",
        href: "https://whop.com/merryhub/products/all-occasion-printable-cards-gift-tags-12-cards-24-tags/",
        text: "12 printable cards and 24 gift tags for any occasion.",
      },
      {
        name: "Planners & Productivity Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/planners-productivity-bundle-undated-daily-weekly-habit-goal-pages",
        text: "Undated daily, weekly, habit and goal pages, 28 A4 pages, editable in the PDF.",
      },
      {
        name: "Christmas Gift Coupons",
        price: "$2",
        href: "https://whop.com/merryhub/products/christmas-gift-coupons-printable-16-coupons-4-blank-instant-download/",
        text: "16 printable gift coupons, plus 4 blank ones.",
      },
      {
        name: "Home Organization Bundle",
        price: "$3",
        href: "https://whop.com/merryhub/home-organization-bundle-meal-planner-cleaning-schedules-declutter",
        text: "Meal planner, grocery lists, cleaning schedules, chores rota and a 30-day declutter challenge — 26 A4 pages, editable in the PDF.",
      },
      {
        name: "Budget & Finance Planner Bundle",
        price: "$4",
        href: "https://whop.com/merryhub/budget-finance-planner-bundle-monthly-budget-bills-savings-debt",
        text: "Monthly budget, bills, savings and debt pages — 28 A4 pages, editable in the PDF.",
      },
    ],
  },
  {
    title: "Small Packs — $2–$3",
    intro: "Smaller packs for one job: elf notes, party games, Advent and quiz night.",
    products: [
      {
        name: "Elf Notes & Letters Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/elf-notes-letters-pack-arrival-goodbye-24-notes-report-card/",
        text: "Arrival and goodbye letters, 24 notes and a report card.",
      },
      {
        name: "Party Games Mini-Pack",
        price: "$3",
        href: "https://whop.com/merryhub/products/christmas-party-games-mini-pack-10-printable-games-answer-keys/",
        text: "10 printable party games with answer keys.",
      },
      {
        name: "Advent Activity Cards",
        price: "$2",
        href: "https://whop.com/merryhub/products/advent-activity-cards-25-printable-cards-for-1-25-december/",
        text: "25 printable cards for 1–25 December.",
      },
      {
        name: "Gift Tags & Santa Letters Set",
        price: "$2",
        href: "https://whop.com/merryhub/products/gift-tags-santa-letters-set-24-tags-letters-editable/",
        text: "24 gift tags and Santa letters, editable.",
      },
      {
        name: "Christmas Quiz Night Pack",
        price: "$2",
        href: "https://whop.com/merryhub/products/christmas-quiz-night-pack-big-quiz-trivia-carols-keys/",
        text: "Big quiz, trivia and carols with answer keys.",
      },
    ],
  },
];

interface ProductRow {
  name: string;
  price_cents: number;
  whop_url: string;
  group_name: string;
  blurb: string;
  sort_order: number;
}

/**
 * The storefront's groups + visible product count. Reads VISIBLE
 * products with the anon key (RLS enforces the same rule), groups them
 * under the three section titles in order, sorted by sort_order inside
 * each section. Any failure — unconfigured, query error, empty table,
 * or rows only in unknown groups — returns the fallback, so the page
 * renders exactly what it renders today. Cached per request so the
 * page and its generateMetadata share one query.
 */
export const loadPrintables = cache(
  async (): Promise<{ groups: PrintableGroup[]; count: number }> => {
    const fallback = {
      groups: FALLBACK_GROUPS,
      count: FALLBACK_GROUPS.reduce((sum, g) => sum + g.products.length, 0),
    };
    const supabase = getAnonSupabase();
    if (!supabase) return fallback;
    const { data, error } = await supabase
      .from("products")
      .select("name,price_cents,whop_url,group_name,blurb,sort_order")
      .eq("visible", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback;

    const rows = data as ProductRow[];
    const groups: PrintableGroup[] = [];
    let count = 0;
    for (const meta of PRODUCT_GROUP_META) {
      const products = rows
        .filter((r) => r.group_name === meta.title)
        .map((r) => ({
          name: r.name,
          price: formatPrice(r.price_cents),
          href: r.whop_url,
          text: r.blurb,
        }));
      if (products.length > 0) {
        groups.push({ title: meta.title, intro: meta.intro, products });
        count += products.length;
      }
    }
    return count > 0 ? { groups, count } : fallback;
  },
);
