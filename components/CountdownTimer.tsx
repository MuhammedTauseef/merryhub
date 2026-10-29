"use client";

import { useEffect, useState } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/dates";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer({
  initial,
  variant = "hero",
}: {
  initial: CountdownParts;
  variant?: "hero" | "page";
}) {
  const [parts, setParts] = useState<CountdownParts>(initial);

  useEffect(() => {
    const tick = () => setParts(getCountdownParts());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (parts.isChristmasDay) {
    return (
      <div className={`countdown countdown-${variant}`} role="timer" aria-label="It is Christmas Day">
        <p className="countdown-today">🎄 It's Christmas Day! 🎄</p>
        <p className="countdown-sub">Merry Christmas — today is the day!</p>
      </div>
    );
  }

  const units: Array<{ value: string; label: string }> = [
    { value: String(parts.days), label: parts.days === 1 ? "Day" : "Days" },
    { value: pad(parts.hours), label: "Hours" },
    { value: pad(parts.minutes), label: "Minutes" },
    { value: pad(parts.seconds), label: "Seconds" },
  ];

  return (
    <div
      className={`countdown countdown-${variant}`}
      role="timer"
      aria-label={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes until Christmas`}
    >
      <div className="countdown-boxes">
        {units.map((u) => (
          <div className="countdown-box" key={u.label}>
            <span className="countdown-value">{u.value}</span>
            <span className="countdown-label">{u.label}</span>
          </div>
        ))}
      </div>
      <p className="countdown-sub">until Christmas Day — 25 December {parts.christmasYear}</p>
    </div>
  );
}
