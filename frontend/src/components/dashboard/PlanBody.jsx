import React from "react";
import renderMarkdown from "../../lib/markdown";
import { useApp } from "../../context/AppContext";

export default function PlanBody({ plan }) {
  const { t } = useApp();
  return (
    <div className="glass rounded-3xl p-6 sm:p-8 mt-5" data-testid="plan-body">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
        {t("dash.plan")}
      </div>
      <div className="plan-md">{renderMarkdown(plan.ai_plan_markdown)}</div>
    </div>
  );
}
