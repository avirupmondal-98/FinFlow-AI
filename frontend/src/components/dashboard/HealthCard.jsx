import React from "react";
import HealthRing from "../HealthRing";
import Dog from "../Dog";
import { useApp } from "../../context/AppContext";

export default function HealthCard({ plan }) {
  const { t } = useApp();
  return (
    <div className="glass rounded-3xl p-6 flex flex-col items-center text-center lg:col-span-1 relative overflow-hidden" id="pdf-health-card">
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
      <div className="flex items-center gap-3 w-full">
        <Dog size={64} />
        <div className="text-left">
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold">
            {t("dash.score")}
          </div>
          <div className="font-display font-extrabold text-lg" data-testid="health-label">
            {plan.health_label}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <HealthRing score={plan.financial_health_score} label={plan.health_label} />
      </div>
    </div>
  );
}
