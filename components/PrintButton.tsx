"use client";

export default function PrintButton({ label = "🖨 Print this page / Save as PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-gold no-print" onClick={() => window.print()}>
      {label}
    </button>
  );
}
