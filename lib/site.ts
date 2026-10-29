export const SITE_NAME = "MerryHub";
export const SITE_TAGLINE = "Christmas Countdown, Wishes & Card Maker";
export const SITE_URL = "https://merryhub.vercel.app";
export const SITE_DESCRIPTION =
  "Make a beautiful Merry Christmas card in seconds and share it anywhere, find original Christmas wishes in five languages, discover your elf name, play the big Christmas quiz and watch the live countdown — all free, no sign-up.";

/** Footer text stamped onto every generated card (the sharing loop). */
export function cardFooterText(host?: string): string {
  const h = host && host.length > 0 ? host : "merryhub.vercel.app";
  return `Made with ${SITE_NAME} • ${h}`;
}
