"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCountdownParts, type CountdownParts } from "@/lib/dates";

/** Slim countdown bar shown at the very top of every page. */
export default function CountdownStrip({ initial }: { initial: CountdownParts }) {
  const [parts, setParts] = useState<CountdownParts>(initial);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown-strip">
      <div className="wrap countdown-strip-inner">
        {parts.isChristmasDay ? (
          <span>
            🎄 <strong>It's Christmas Day!</strong> Merry Christmas from MerryHub 🎄
          </span>
        ) : (
          <span>
            🎄 <strong>{parts.days} day{parts.days === 1 ? "" : "s"}, {parts.hours} hrs</strong> until Christmas
          </span>
        )}
        <Link href="/countdown" className="countdown-strip-link">
          Live countdown →
        </Link>
      </div>
    </div>
  );
}
