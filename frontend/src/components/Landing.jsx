import React from "react";
import { ArrowRight, TrendingUp, Target, Sparkles } from "lucide-react";
import Dog from "./Dog";
import { useApp } from "../context/AppContext";

export default function Landing({ onStart }) {
  const { t } = useApp();
  return (
    <section className="relative overflow-hidden" data-testid="landing-hero">
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <div className="absolute inset-0 bg-dotted opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-bold tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            {t("heroKicker")}
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter">
            {t("heroTitle").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-gradient">{t("heroTitle").split(" ").slice(-2).join(" ")}</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[var(--muted-fg)] max-w-2xl leading-relaxed">
            {t("heroSub")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3" data-testid="landing-cta-row">
            <button onClick={onStart} className="btn-primary inline-flex items-center gap-2" data-testid="hero-start-btn">
              {t("ctaStart")} <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#features" className="btn-secondary inline-flex items-center gap-2">
              {t("ctaHow")}
            </a>
          </div>

          <div id="features" className="mt-14 grid sm:grid-cols-3 gap-4">
            {[
              { icon: <TrendingUp className="h-5 w-5" />, k: "features.one" },
              { icon: <Target className="h-5 w-5" />, k: "features.two" },
              { icon: <Sparkles className="h-5 w-5" />, k: "features.three" },
            ].map((f, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-5 animate-fade-up"
                style={{ animationDelay: `${120 * (i + 1)}ms` }}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 grid place-items-center text-white mb-3">
                  {f.icon}
                </div>
                <div className="font-display font-extrabold text-base">{t(`${f.k}.t`)}</div>
                <div className="text-sm text-[var(--muted-fg)] mt-1">{t(`${f.k}.d`)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual side */}
        <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "180ms" }}>
          <div className="relative glass rounded-3xl p-8 shadow-[0_32px_60px_-20px_rgba(20,184,166,0.35)] overflow-hidden">
            <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full bg-teal-400/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-blue-600/30 blur-3xl" />

            <div className="relative flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)]">
                  Preview
                </div>
                <div className="font-display font-black text-xl">Financial Health</div>
              </div>
              <Dog size={80} />
            </div>

            {/* fake score ring */}
            <div className="relative h-48 grid place-items-center">
              <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(100,116,139,0.18)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52 * 0.78} ${2 * Math.PI * 52}`}
                />
                <defs>
                  <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <div className="font-display font-black text-5xl">78</div>
                <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] mt-1">Good</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { l: "Income", v: "₹1.2L" },
                { l: "Expense", v: "₹74K" },
                { l: "Save", v: "₹46K" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl bg-white/70 dark:bg-white/5 border border-[var(--border)] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted-fg)]">{s.l}</div>
                  <div className="font-display font-extrabold text-lg mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
