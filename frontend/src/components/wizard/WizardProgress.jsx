import React from "react";

export default function WizardProgress({ steps, step }) {
  return (
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
  );
}
