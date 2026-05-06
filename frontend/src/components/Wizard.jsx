import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

const EMPTY = {
  personal: { name: "", age: 28, city: "", family_members: 1, risk_appetite: "Medium" },
  income: { monthly_salary: 0, other_income: 0, spouse_income: 0 },
  expenses: { daily_expense: 0, monthly_fixed_expense: 0, emis: [] },
  assets: { savings: 0, mutual_funds: 0, fixed_deposits: 0, stocks: 0, loans: 0 },
  goals: [{ name: "Emergency Fund", target_amount: 300000, timeframe_years: 1, priority: "High" }],
};

function Num({ label, value, onChange, testId, placeholder = "0" }) {
  return (
    <div>
      <label className="lbl">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className="inp"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
        data-testid={testId}
      />
    </div>
  );
}

export default function Wizard({ onSubmit, loading }) {
  const { t, dict } = useApp();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY);

  const steps = [
    t("steps.personal"),
    t("steps.income"),
    t("steps.expenses"),
    t("steps.assets"),
    t("steps.goals"),
  ];

  const update = (section, key, value) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));

  const updateEmi = (idx, key, value) =>
    setData((d) => ({
      ...d,
      expenses: {
        ...d.expenses,
        emis: d.expenses.emis.map((e, i) => (i === idx ? { ...e, [key]: value } : e)),
      },
    }));

  const addEmi = () =>
    setData((d) => ({
      ...d,
      expenses: {
        ...d.expenses,
        emis: [...d.expenses.emis, { name: "", amount: 0, months_left: 0 }],
      },
    }));

  const removeEmi = (idx) =>
    setData((d) => ({
      ...d,
      expenses: { ...d.expenses, emis: d.expenses.emis.filter((_, i) => i !== idx) },
    }));

  const updateGoal = (idx, key, value) =>
    setData((d) => ({
      ...d,
      goals: d.goals.map((g, i) => (i === idx ? { ...g, [key]: value } : g)),
    }));

  const addGoal = () =>
    setData((d) => ({
      ...d,
      goals: [...d.goals, { name: "", target_amount: 0, timeframe_years: 1, priority: "Medium" }],
    }));

  const removeGoal = (idx) =>
    setData((d) => ({ ...d, goals: d.goals.filter((_, i) => i !== idx) }));

  const canContinue = () => {
    if (step === 0) return data.personal.name.trim().length > 1 && data.personal.age > 0;
    if (step === 1) return data.income.monthly_salary + data.income.other_income + data.income.spouse_income > 0;
    if (step === 4) return data.goals.length === 0 || data.goals.every((g) => g.name && g.target_amount > 0);
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <section className="relative max-w-3xl mx-auto px-5 sm:px-0 -mt-6 pb-24" data-testid="wizard">
      <div className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden animate-fade-up">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
        {/* progress */}
        <div className="flex items-center gap-2 mb-8" data-testid="wizard-step-indicator">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                  i === step ? "text-gradient" : "text-[var(--muted-fg)]"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-full grid place-items-center text-[11px] font-black ${
                    i <= step
                      ? "bg-gradient-to-br from-blue-600 to-teal-500 text-white"
                      : "bg-white/60 dark:bg-white/5 border border-[var(--border)] text-[var(--muted-fg)]"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full ${
                    i < step ? "bg-gradient-to-r from-blue-600 to-teal-500" : "bg-slate-200 dark:bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div key={step} className="animate-fade-up">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="lbl">{t("fields.name")}</label>
                <input
                  className="inp"
                  value={data.personal.name}
                  onChange={(e) => update("personal", "name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  data-testid="input-name"
                />
              </div>
              <Num
                label={t("fields.age")}
                value={data.personal.age}
                onChange={(v) => update("personal", "age", v)}
                testId="input-age"
                placeholder="28"
              />
              <div>
                <label className="lbl">{t("fields.city")}</label>
                <input
                  className="inp"
                  value={data.personal.city}
                  onChange={(e) => update("personal", "city", e.target.value)}
                  placeholder="Mumbai"
                  data-testid="input-city"
                />
              </div>
              <Num
                label={t("fields.family")}
                value={data.personal.family_members}
                onChange={(v) => update("personal", "family_members", v)}
                testId="input-family"
                placeholder="1"
              />
              <div className="sm:col-span-2">
                <label className="lbl">{t("fields.risk")}</label>
                <div className="grid grid-cols-3 gap-2" data-testid="risk-group">
                  {["Low", "Medium", "High"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update("personal", "risk_appetite", r)}
                      data-testid={`risk-${r.toLowerCase()}`}
                      className={`py-3 rounded-xl border text-sm font-bold transition ${
                        data.personal.risk_appetite === r
                          ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white border-transparent shadow-lg shadow-teal-500/30"
                          : "border-[var(--border)] bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
                      }`}
                    >
                      {dict.risk[r]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-3 gap-4">
              <Num label={t("fields.monthly_salary")} value={data.income.monthly_salary}
                onChange={(v) => update("income", "monthly_salary", v)} testId="input-salary" />
              <Num label={t("fields.other_income")} value={data.income.other_income}
                onChange={(v) => update("income", "other_income", v)} testId="input-other-income" />
              <Num label={t("fields.spouse_income")} value={data.income.spouse_income}
                onChange={(v) => update("income", "spouse_income", v)} testId="input-spouse-income" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <Num label={t("fields.daily_expense")} value={data.expenses.daily_expense}
                  onChange={(v) => update("expenses", "daily_expense", v)} testId="input-daily" />
                <Num label={t("fields.monthly_fixed")} value={data.expenses.monthly_fixed_expense}
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
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end" data-testid={`emi-row-${idx}`}>
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
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Num label={t("fields.savings")} value={data.assets.savings} onChange={(v) => update("assets", "savings", v)} testId="input-savings" />
              <Num label={t("fields.mf")} value={data.assets.mutual_funds} onChange={(v) => update("assets", "mutual_funds", v)} testId="input-mf" />
              <Num label={t("fields.fd")} value={data.assets.fixed_deposits} onChange={(v) => update("assets", "fixed_deposits", v)} testId="input-fd" />
              <Num label={t("fields.stocks")} value={data.assets.stocks} onChange={(v) => update("assets", "stocks", v)} testId="input-stocks" />
              <Num label={t("fields.loans")} value={data.assets.loans} onChange={(v) => update("assets", "loans", v)} testId="input-loans" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {data.goals.map((g, idx) => (
                <div key={idx} className="rounded-2xl border border-[var(--border)] p-4 bg-white/40 dark:bg-white/[0.02]" data-testid={`goal-row-${idx}`}>
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
                        {["Low", "Medium", "High"].map((p) => (
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
          )}
        </div>

        {/* footer nav */}
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="wizard-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("actions.back")}
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => canContinue() && next()}
              disabled={!canContinue()}
              className="btn-primary inline-flex items-center gap-2"
              data-testid="wizard-next-btn"
            >
              {t("actions.next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSubmit(data)}
              disabled={loading || !canContinue()}
              className="btn-primary inline-flex items-center gap-2"
              data-testid="generate-plan-btn"
            >
              <Sparkles className="h-4 w-4" />
              {t("actions.generate")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
