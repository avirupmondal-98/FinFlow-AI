import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import useWizardState, { canContinueAt } from "../hooks/useWizardState";
import WizardProgress from "./wizard/WizardProgress";
import StepPersonal from "./wizard/StepPersonal";
import StepIncome from "./wizard/StepIncome";
import StepExpenses from "./wizard/StepExpenses";
import StepAssets from "./wizard/StepAssets";
import StepGoals from "./wizard/StepGoals";

const TOTAL_STEPS = 5;

export default function Wizard({ onSubmit, loading }) {
  const { t } = useApp();
  const [step, setStep] = useState(0);
  const wizard = useWizardState();
  const { data } = wizard;

  const steps = useMemo(
    () => [
      t("steps.personal"),
      t("steps.income"),
      t("steps.expenses"),
      t("steps.assets"),
      t("steps.goals"),
    ],
    [t]
  );

  const canContinue = canContinueAt(step, data);
  const isLastStep = step === TOTAL_STEPS - 1;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <section className="relative max-w-3xl mx-auto px-5 sm:px-0 -mt-6 pb-24" data-testid="wizard">
      <div className="glass rounded-3xl p-6 sm:p-10 relative overflow-hidden animate-fade-up">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />

        <WizardProgress steps={steps} step={step} />

        <div key={step} className="animate-fade-up">
          {step === 0 && <StepPersonal data={data} update={wizard.update} />}
          {step === 1 && <StepIncome data={data} update={wizard.update} />}
          {step === 2 && (
            <StepExpenses
              data={data}
              update={wizard.update}
              addEmi={wizard.addEmi}
              updateEmi={wizard.updateEmi}
              removeEmi={wizard.removeEmi}
            />
          )}
          {step === 3 && <StepAssets data={data} update={wizard.update} />}
          {step === 4 && (
            <StepGoals
              data={data}
              addGoal={wizard.addGoal}
              updateGoal={wizard.updateGoal}
              removeGoal={wizard.removeGoal}
            />
          )}
        </div>

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

          {!isLastStep ? (
            <button
              type="button"
              onClick={() => canContinue && next()}
              disabled={!canContinue}
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
              disabled={loading || !canContinue}
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
