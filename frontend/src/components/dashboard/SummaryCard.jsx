import React from "react";
import { useApp } from "../../context/AppContext";

export default function SummaryCard({ plan }) {
  const { t } = useApp();
  return (
    <div className="glass rounded-3xl p-6 lg:col-span-2">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-3">
        {t("dash.summary")}
      </div>
      <p className="text-lg leading-relaxed" data-testid="ai-summary">
        {plan.ai_summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 border border-[var(--border)]"
          data-testid="model-used-chip"
        >
          {plan.model_used === "claude-sonnet-4-5" ? "Claude Sonnet 4.5" : "GPT-5.2"}
        </span>
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 border border-[var(--border)]">
          {plan.language === "hi" ? "हिन्दी" : "English"}
        </span>
      </div>
    </div>
  );
}
