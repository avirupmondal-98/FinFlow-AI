import React from "react";
import { inr } from "../../lib/format";
import { useApp } from "../../context/AppContext";

function GoalRow({ goal, index }) {
  const { t } = useApp();
  const desired = Math.max(1, Math.round(goal.timeframe_years * 12));
  const progress = Math.min(
    100,
    Math.round((desired / Math.max(goal.months_to_achieve, 1)) * 100)
  );
  return (
    <div
      className="rounded-2xl bg-white/50 dark:bg-white/5 border border-[var(--border)] p-4"
      data-testid={`goal-item-${index}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-display font-extrabold text-lg">{goal.name}</div>
          <div className="text-xs text-[var(--muted-fg)] mt-0.5">
            {inr(goal.target_amount)} · {goal.timeframe_years}y · {goal.priority} priority
          </div>
        </div>
        <span
          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
            goal.on_track
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-amber-500/15 text-amber-500"
          }`}
        >
          {goal.on_track ? t("dash.onTrack") : t("dash.offTrack")}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-slate-200/60 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-teal-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-[var(--muted-fg)] whitespace-nowrap">
          {inr(goal.monthly_contribution)}/mo · {goal.months_to_achieve} {t("dash.months")}
        </div>
      </div>
    </div>
  );
}

export default function GoalTimeline({ plan }) {
  const { t } = useApp();
  const goals = plan.goal_timeline || [];
  return (
    <div className="glass rounded-3xl p-6 lg:col-span-2" data-testid="goal-timeline">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
        {t("dash.goals")}
      </div>
      {goals.length === 0 && (
        <div className="text-[var(--muted-fg)] italic">No goals added.</div>
      )}
      <div className="space-y-4">
        {goals.map((g, i) => (
          <GoalRow key={`${g.name}-${i}`} goal={g} index={i} />
        ))}
      </div>
    </div>
  );
}
