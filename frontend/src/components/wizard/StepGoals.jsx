import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";

const PRIORITIES = ["Low", "Medium", "High"];

export default function StepGoals({ data, addGoal, updateGoal, removeGoal }) {
  const { t, dict } = useApp();
  return (
    <div className="space-y-4">
      {data.goals.map((g, idx) => (
        <div key={g.id} className="rounded-2xl border border-[var(--border)] p-4 bg-white/40 dark:bg-white/[0.02]" data-testid={`goal-row-${idx}`}>
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 sm:col-span-5">
              <label className="lbl">{t("fields.goal_name")}</label>
              <input className="inp" value={g.name} onChange={(e) => updateGoal(idx, "name", e.target.value)} placeholder="Buy a home" />
            </div>
            <div className="col-span-6 sm:col-span-3">
              <label className="lbl">{t("fields.target")}</label>
              <input type="number" className="inp" value={g.target_amount || ""} onChange={(e) => updateGoal(idx, "target_amount", Number(e.target.value || 0))} placeholder="0" />
            </div>
            <div className="col-span-3 sm:col-span-2">
              <label className="lbl">{t("fields.years")}</label>
              <input type="number" step="0.5" className="inp" value={g.timeframe_years || ""} onChange={(e) => updateGoal(idx, "timeframe_years", Number(e.target.value || 0))} placeholder="5" />
            </div>
            <div className="col-span-6 sm:col-span-1">
              <label className="lbl">{t("fields.priority")}</label>
              <select className="inp" value={g.priority} onChange={(e) => updateGoal(idx, "priority", e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{dict.priority[p]}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3 sm:col-span-1">
              <button type="button" onClick={() => removeGoal(idx)} className="h-11 w-full grid place-items-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addGoal} className="btn-secondary inline-flex items-center gap-2" data-testid="add-goal-btn">
        <Plus className="h-4 w-4" />
        {t("actions.addGoal")}
      </button>
    </div>
  );
}
