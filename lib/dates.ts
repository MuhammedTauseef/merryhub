export interface CountdownParts {
  target: Date;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isChristmasDay: boolean;
  christmasYear: number;
}

/** Start of Christmas Day (local time) for the given year. */
export function christmasDay(year: number): Date {
  return new Date(year, 11, 25, 0, 0, 0, 0);
}

/**
 * The Christmas we are counting down to: this year's, unless Christmas Day
 * is fully over (Dec 26 00:00 local), in which case next year's.
 */
export function getChristmasTarget(now: Date = new Date()): Date {
  const year = now.getFullYear();
  const endOfChristmasDay = new Date(year, 11, 26, 0, 0, 0, 0);
  if (now.getTime() >= endOfChristmasDay.getTime()) {
    return christmasDay(year + 1);
  }
  return christmasDay(year);
}

export function getCountdownParts(now: Date = new Date()): CountdownParts {
  const target = getChristmasTarget(now);
  const isChristmasDay = now.getMonth() === 11 && now.getDate() === 25;
  const diff = Math.max(0, target.getTime() - now.getTime());
  return {
    target,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
    isChristmasDay,
    christmasYear: target.getFullYear(),
  };
}

/** Whole calendar days between two dates (ignores time of day). */
export function calendarDaysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function longDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
