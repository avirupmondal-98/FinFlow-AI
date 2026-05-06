import { useCallback, useState } from "react";

const newId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const INITIAL = {
  personal: { name: "", age: 28, city: "", family_members: 1, risk_appetite: "Medium" },
  income: { monthly_salary: 0, other_income: 0, spouse_income: 0 },
  expenses: { daily_expense: 0, monthly_fixed_expense: 0, emis: [] },
  assets: { savings: 0, mutual_funds: 0, fixed_deposits: 0, stocks: 0, loans: 0 },
  goals: [{ id: "g-default", name: "Emergency Fund", target_amount: 300000, timeframe_years: 1, priority: "High" }],
};

export default function useWizardState() {
  const [data, setData] = useState(INITIAL);

  const update = useCallback(
    (section, key, value) =>
      setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } })),
    []
  );

  const updateEmi = useCallback(
    (idx, key, value) =>
      setData((d) => ({
        ...d,
        expenses: {
          ...d.expenses,
          emis: d.expenses.emis.map((e, i) => (i === idx ? { ...e, [key]: value } : e)),
        },
      })),
    []
  );

  const addEmi = useCallback(
    () =>
      setData((d) => ({
        ...d,
        expenses: {
          ...d.expenses,
          emis: [
            ...d.expenses.emis,
            { id: newId("emi"), name: "", amount: 0, months_left: 0 },
          ],
        },
      })),
    []
  );

  const removeEmi = useCallback(
    (idx) =>
      setData((d) => ({
        ...d,
        expenses: { ...d.expenses, emis: d.expenses.emis.filter((_, i) => i !== idx) },
      })),
    []
  );

  const updateGoal = useCallback(
    (idx, key, value) =>
      setData((d) => ({
        ...d,
        goals: d.goals.map((g, i) => (i === idx ? { ...g, [key]: value } : g)),
      })),
    []
  );

  const addGoal = useCallback(
    () =>
      setData((d) => ({
        ...d,
        goals: [
          ...d.goals,
          { id: newId("goal"), name: "", target_amount: 0, timeframe_years: 1, priority: "Medium" },
        ],
      })),
    []
  );

  const removeGoal = useCallback(
    (idx) => setData((d) => ({ ...d, goals: d.goals.filter((_, i) => i !== idx) })),
    []
  );

  return {
    data,
    update,
    updateEmi,
    addEmi,
    removeEmi,
    updateGoal,
    addGoal,
    removeGoal,
  };
}

export function canContinueAt(step, data) {
  if (step === 0) return data.personal.name.trim().length > 1 && data.personal.age > 0;
  if (step === 1)
    return (
      data.income.monthly_salary + data.income.other_income + data.income.spouse_income > 0
    );
  if (step === 4)
    return data.goals.length === 0 || data.goals.every((g) => g.name && g.target_amount > 0);
  return true;
}
