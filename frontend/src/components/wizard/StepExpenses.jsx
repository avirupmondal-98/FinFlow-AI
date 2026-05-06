import React from "react";
import { Plus, Trash2 } from "lucide-react";
import NumInput from "./NumInput";
import { useApp } from "../../context/AppContext";

export default function StepExpenses({ data, update, addEmi, updateEmi, removeEmi }) {
  const { t } = useApp();
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <NumInput label={t("fields.daily_expense")} value={data.expenses.daily_expense}
          onChange={(v) => update("expenses", "daily_expense", v)} testId="input-daily" />
        <NumInput label={t("fields.monthly_fixed")} value={data.expenses.monthly_fixed_expense}
          onChange={(v) => update("expenses", "monthly_fixed_expense", v)} testId="input-monthly-fixed" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="lbl">EMIs</label>
          <button type="button" onClick={addEmi} className="text-xs font-bold text-teal-600 dark:text-teal-400 inline-flex items-center gap-1" data-testid="add-emi-btn">
            <Plus className="h-4 w-4" />
            {t("actions.addEmi")}
          </button>
        </div>
        <div className="space-y-3">
          {data.expenses.emis.length === 0 && (
            <div className="text-sm text-[var(--muted-fg)] italic">No EMIs added.</div>
          )}
          {data.expenses.emis.map((emi, idx) => (
            <div key={emi.id} className="grid grid-cols-12 gap-2 items-end" data-testid={`emi-row-${idx}`}>
              <div className="col-span-12 sm:col-span-5">
                <label className="lbl">{t("fields.emi_name")}</label>
                <input className="inp" value={emi.name} onChange={(e) => updateEmi(idx, "name", e.target.value)} placeholder="Car loan" />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="lbl">{t("fields.emi_amount")}</label>
                <input type="number" className="inp" value={emi.amount || ""} onChange={(e) => updateEmi(idx, "amount", Number(e.target.value || 0))} placeholder="0" />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className="lbl">{t("fields.emi_months")}</label>
                <input type="number" className="inp" value={emi.months_left || ""} onChange={(e) => updateEmi(idx, "months_left", Number(e.target.value || 0))} placeholder="0" />
              </div>
              <div className="col-span-12 sm:col-span-1">
                <button type="button" onClick={() => removeEmi(idx)} className="h-11 w-full grid place-items-center rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 transition" aria-label="Remove EMI">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
