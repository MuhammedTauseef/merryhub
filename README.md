# MerryHub — Christmas Countdown, Wishes & Card Maker

A free, festive Christmas tools site:

- **Card maker as the homepage hero** (also at `/card-maker`) — canvas-drawn designs, download as PNG, share via Web Share / WhatsApp / Facebook. Every card carries a "Made with MerryHub" footer.
- **Live countdown** — a slim strip on every page + a dedicated `/countdown` page.
- **Wishes library** (`/wishes` + 15 category pages) — original wishes by recipient and tone, plus Urdu, Hindi, Spanish and Tagalog collections; copy buttons and "make a card with this" links.
- **Elf Name Generator** (`/elf-name-generator`) and **Christmas Quiz** (`/christmas-quiz`, printable with answer key).
- `/printables` — the printable pack page (sales slot is a placeholder; channel TBD), `/about`, `/privacy`, `/contact`.

Fully static Next.js (App Router). No database, no sign-up, everything runs client-side.

## Develop

```bash
npm install
npm run dev
npm run build
node scripts/verify.mjs   # logic checks (countdown + elf names + card designs)
```
