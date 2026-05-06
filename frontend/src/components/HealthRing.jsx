import React from "react";

export default function HealthRing({ score = 0, label = "" }) {
  const safe = Math.max(0, Math.min(100, score));
  const R = 52;
  const C = 2 * Math.PI * R;
  const dash = (safe / 100) * C;

  let stroke = "url(#grad-green)";
  if (safe < 50) stroke = "url(#grad-red)";
  else if (safe < 70) stroke = "url(#grad-amber)";

  return (
    <div className="relative grid place-items-center" data-testid="dashboard-health-score">
      <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
        <defs>
          <linearGradient id="grad-green" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="grad-amber" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="grad-red" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(100,116,139,0.18)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 900ms ease-out" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display font-black text-5xl leading-none" data-testid="health-score-value">{safe}</div>
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] mt-2">{label}</div>
      </div>
    </div>
  );
}
