import type { FaqItem } from "@/components/Faq";
import type { WishCategory } from "@/lib/wishes";
import { WISH_CATEGORIES } from "@/lib/wishes";

const totalWishes = WISH_CATEGORIES.reduce((n, c) => n + c.wishes.length, 0);

/** FAQs for one wishes collection page. Every answer states only what the
 *  page itself offers — the wishes are original, free to copy, and can be
 *  placed on a card with the free card maker. */
export function categoryFaqs(cat: WishCategory): FaqItem[] {
  const audience = cat.title.replace(/^Christmas Wishes\s*/i, "").trim() || cat.title;
  return [
    {
      q: `Are these Christmas wishes for ${audience.toLowerCase()} free to use?`,
      a: `Yes. Every wish on this page was written for MerryHub and is free to copy and send — in a card, a message or a chat. No sign-up and no payment, ever.`,
    },
    {
      q: `Can I put one of these wishes on a Christmas card?`,
      a: `Yes. Tap "Make a card with this" on any wish and it lands in our free Christmas card maker, where you add the person's name, pick a design and download the finished card as a picture to share anywhere.`,
    },
    {
      q: `How many wishes are in this collection?`,
      a: `This collection has ${cat.wishes.length} original wishes. Across all ${WISH_CATEGORIES.length} collections the library holds ${totalWishes} wishes — for family, friends, your boss, coworkers, clients, teachers and kids, plus funny, short, romantic and religious collections and wishes in Urdu, Hindi, Spanish and Tagalog.`,
    },
  ];
}

export const WISHES_INDEX_FAQS: FaqItem[] = [
  {
    q: "Are these Christmas wishes original?",
    a: `Yes. All ${totalWishes} wishes in the library were written for MerryHub — they are not copied from other websites — and new collections are written in the same way.`,
  },
  {
    q: "What should I write in a Christmas card?",
    a: "Start with who the card is for. A short, warm wish suits a card you are signing quickly; a longer message suits family and close friends. Pick the collection for your recipient above — every wish can be copied as it is, or personalised with the person's name in the free card maker.",
  },
  {
    q: "Which languages are the wishes in?",
    a: "Most collections are in English. There are also full collections in Urdu (in Urdu script and in Roman Urdu), Hindi, Spanish and Tagalog, each written for the people who celebrate in those languages.",
  },
  {
    q: "Can I send a wish as a picture card on WhatsApp?",
    a: "Yes. Open any wish, tap \"Make a card with this\", add the name and download the card as a picture — then share it in any chat, including WhatsApp and Facebook, straight from your phone.",
  },
];

export const PRINTABLES_FAQS: FaqItem[] = [
  {
    q: "Is the free printable sample really free?",
    a: "Yes. The sample is a 2-page A4 PDF — one printable greeting card sheet and one sheet of 12 gift tags, both taken from the real pack. It downloads instantly with no email sign-up and no catch.",
  },
  {
    q: "What do I need to print the pack?",
    a: "An ordinary home printer and A4 paper (Letter size works too). Cards print one per sheet and fold in half; tags, activity cards and place cards have light dashed cut guides. Colour looks best, but every sheet also works in greyscale.",
  },
  {
    q: "What is in the full printable pack?",
    a: "55 print-ready A4 pages: 12 greeting cards, 24 gift tags, the big Christmas quiz with its answer key, an 11-game party bundle (including 10 bingo cards and a Secret Santa questionnaire), a letter from Santa, a letter to Santa, a Nice List certificate, the Elf Kit with 24 daily elf notes, 25 Advent activity cards and table place cards.",
  },
  {
    q: "When can I buy the full pack?",
    a: "Every file is finished and test-printed; we are setting up the shop now. The buy button will appear on this page when it launches — there are no pre-orders and no email sign-ups in the meantime.",
  },
  {
    q: "Can I print copies for my class or office?",
    a: "The quiz, games and Advent cards are designed to be printed once per player or per day, so a teacher or party host can print the sheets their group needs from their own copy of the pack.",
  },
];

export const QUIZ_FAQS: FaqItem[] = [
  {
    q: "How many questions are in the Christmas quiz?",
    a: "Twelve questions, covering stockings, reindeer, carols and Christmas traditions — each with a short story behind the answer in the quizmaster's key.",
  },
  {
    q: "Can I print the quiz?",
    a: "Yes. Use the print button at the top of this page to print the questions (or save them as a PDF) with space to write answers, and the answer key prints at the end. A designed printable version is also part of the MerryHub printable pack.",
  },
  {
    q: "Is the quiz suitable for a classroom or office party?",
    a: "Yes — the questions are family-friendly and general-knowledge, written to be read aloud to a group, with one point per correct answer.",
  },
];

export const ELF_FAQS: FaqItem[] = [
  {
    q: "How does the elf name generator work?",
    a: "Your elf first name comes from the first letter of your name, and your elf surname is built from your birth month and the last letter of your name. You also get an official North Pole workshop job title to match.",
  },
  {
    q: "Will I always get the same elf name?",
    a: "Yes. The same name and birth month always produce the same elf name and job title, so your elf identity is yours every time you come back.",
  },
  {
    q: "Is the elf name generator free?",
    a: "Yes — free and instant, with no sign-up. Generate one for your whole family, class or office and compare job titles.",
  },
];
