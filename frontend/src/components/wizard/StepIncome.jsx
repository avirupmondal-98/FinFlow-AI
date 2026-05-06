import React from "react";
import NumInput from "./NumInput";
import { useApp } from "../../context/AppContext";

export default function StepIncome({ data, update }) {
  const { t } = useApp();
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <NumInput label={t("fields.monthly_salary")} value={data.income.monthly_salary}
        onChange={(v) => update("income", "monthly_salary", v)} testId="input-salary" />
      <NumInput label={t("fields.other_income")} value={data.income.other_income}
        onChange={(v) => update("income", "other_income", v)} testId="input-other-income" />
      <NumInput label={t("fields.spouse_income")} value={data.income.spouse_income}
        onChange={(v) => update("income", "spouse_income", v)} testId="input-spouse-income" />
    </div>
  );
}
