import React from "react";
import NumInput from "./NumInput";
import { useApp } from "../../context/AppContext";

const RISKS = ["Low", "Medium", "High"];

export default function StepPersonal({ data, update }) {
  const { t, dict } = useApp();
  return (
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
      <NumInput
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
      <NumInput
        label={t("fields.family")}
        value={data.personal.family_members}
        onChange={(v) => update("personal", "family_members", v)}
        testId="input-family"
        placeholder="1"
      />
      <div className="sm:col-span-2">
        <label className="lbl">{t("fields.risk")}</label>
        <div className="grid grid-cols-3 gap-2" data-testid="risk-group">
          {RISKS.map((r) => (
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
  );
}
