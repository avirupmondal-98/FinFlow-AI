import React from "react";

/** Cute SVG dog with animated tail, blinking eyes, and optional bounce. */
export default function Dog({ size = 160, mood = "happy", bouncing = true }) {
  return (
    <div
      className={bouncing ? "animate-bounce-soft" : ""}
      style={{ width: size, height: size }}
      data-testid="pet-dog"
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bodyGrad" cx="0.5" cy="0.4" r="0.75">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="bellyGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="100%" stopColor="#fde68a" />
          </radialGradient>
          <linearGradient id="collar" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="100" cy="178" rx="48" ry="6" fill="rgba(0,0,0,0.18)" />

        {/* Tail — wags */}
        <g
          style={{ transformOrigin: "46px 118px" }}
          className="animate-wag"
        >
          <path
            d="M46 118 q-22 -8 -30 -28 q 14 -2 26 10 q 6 8 8 18 z"
            fill="url(#bodyGrad)"
            stroke="#92400e"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Back leg */}
        <ellipse cx="68" cy="160" rx="14" ry="10" fill="#b45309" />
        <ellipse cx="132" cy="160" rx="14" ry="10" fill="#b45309" />

        {/* Body */}
        <ellipse cx="100" cy="130" rx="52" ry="38" fill="url(#bodyGrad)" stroke="#92400e" strokeWidth="2" />
        {/* Belly */}
        <ellipse cx="100" cy="140" rx="28" ry="22" fill="url(#bellyGrad)" />

        {/* Front paws */}
        <ellipse cx="80" cy="168" rx="12" ry="7" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
        <ellipse cx="120" cy="168" rx="12" ry="7" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />

        {/* Head */}
        <g>
          {/* Ears */}
          <path d="M56 66 Q52 38 78 44 L84 74 Z" fill="#92400e" />
          <path d="M144 66 Q148 38 122 44 L116 74 Z" fill="#92400e" />

          <circle cx="100" cy="86" r="42" fill="url(#bodyGrad)" stroke="#92400e" strokeWidth="2" />

          {/* Patch around eye */}
          <ellipse cx="118" cy="82" rx="16" ry="13" fill="#92400e" opacity="0.55" />

          {/* Eyes — blink */}
          <g style={{ transformOrigin: "100px 84px" }} className="animate-blink">
            <ellipse cx="86" cy="84" rx="5" ry="6" fill="#0f172a" />
            <ellipse cx="114" cy="84" rx="5" ry="6" fill="#0f172a" />
            <circle cx="88" cy="82" r="1.5" fill="#ffffff" />
            <circle cx="116" cy="82" r="1.5" fill="#ffffff" />
          </g>

          {/* Nose */}
          <ellipse cx="100" cy="100" rx="7" ry="5" fill="#0f172a" />
          <path d="M100 104 Q100 112 94 114" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M100 104 Q100 112 106 114" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Tongue when happy */}
          {mood === "happy" && (
            <path d="M96 114 Q100 120 104 114 L104 118 Q100 124 96 118 Z" fill="#f472b6" />
          )}

          {/* Cheek blush */}
          <circle cx="74" cy="98" r="4" fill="#fb7185" opacity="0.45" />
          <circle cx="126" cy="98" r="4" fill="#fb7185" opacity="0.45" />
        </g>

        {/* Collar with tag */}
        <rect x="76" y="120" width="48" height="8" rx="3" fill="url(#collar)" />
        <circle cx="100" cy="130" r="5" fill="#14b8a6" stroke="#ffffff" strokeWidth="1.5" />
        <text x="100" y="132" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="800">₹</text>
      </svg>
    </div>
  );
}
