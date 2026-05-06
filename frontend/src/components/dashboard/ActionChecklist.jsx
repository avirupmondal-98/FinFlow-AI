import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ActionChecklist({ plan }) {
  const { t } = useApp();
  const items = plan.monthly_action_checklist || [];
  return (
    <div className="glass rounded-3xl p-6" data-testid="action-checklist">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
        {t("dash.checklist")}
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-[var(--border)]"
            data-testid={`checklist-${i}`}
          >
            <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
