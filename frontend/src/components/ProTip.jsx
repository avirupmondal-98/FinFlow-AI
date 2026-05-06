import React, { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { randomTip } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function ProTip({ nonce = 0, initialTip = "" }) {
  const { t, lang } = useApp();
  const [tip, setTip] = useState(initialTip);
  const [visible, setVisible] = useState(true);
  const [anim, setAnim] = useState(0);

  // Sync incoming tip whenever a brand-new plan provides one.
  useEffect(() => {
    if (initialTip) {
      setTip(initialTip);
      setVisible(true);
    }
  }, [initialTip]);

  // Fetch a fresh tip on each plan-generation cycle (skip the initial mount).
  useEffect(() => {
    if (nonce <= 0) return undefined;
    let cancelled = false;
    randomTip(lang)
      .then((res) => {
        if (cancelled) return;
        setTip(res.tip);
        setAnim((a) => a + 1);
        setVisible(true);
      })
      .catch(() => {
        /* swallow — keep last shown tip */
      });
    return () => {
      cancelled = true;
    };
  }, [nonce, lang]);

  if (!visible || !tip) return null;

  return (
    <div
      key={anim}
      className="fixed bottom-6 right-6 z-40 max-w-sm w-[calc(100%-3rem)] sm:w-80 animate-fade-up"
      data-testid="pro-tip-card"
    >
      <div className="relative glass rounded-3xl p-5 overflow-hidden shimmer-bar animate-glow-pulse border-2 border-white/40 dark:border-white/10">
        <div className="absolute -top-14 -right-10 h-32 w-32 rounded-full bg-teal-400/30 blur-3xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-teal-400 grid place-items-center text-white">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="font-display font-black text-sm uppercase tracking-widest text-gradient">
                {t("dash.proTip")}
              </div>
            </div>
            <div className="text-sm font-semibold leading-snug" data-testid="pro-tip-text">
              {tip}
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="h-7 w-7 grid place-items-center rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/90"
            aria-label="Dismiss"
            data-testid="pro-tip-close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
