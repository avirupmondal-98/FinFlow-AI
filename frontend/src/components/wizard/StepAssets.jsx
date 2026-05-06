import React from "react";
import NumInput from "./NumInput";
import { useApp } from "../../context/AppContext";

export default function StepAssets({ data, update }) {
  const { t } = useApp();
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <NumInput label={t("fields.savings")} value={data.assets.savings} onChange={(v) => update("assets", "savings", v)} testId="input-savings" />
      <NumInput label={t("fields.mf")} value={data.assets.mutual_funds} onChange={(v) => update("assets", "mutual_funds", v)} testId="input-mf" />
      <NumInput label={t("fields.fd")} value={data.assets.fixed_deposits} onChange={(v) => update("assets", "fixed_deposits", v)} testId="input-fd" />
      <NumInput label={t("fields.stocks")} value={data.assets.stocks} onChange={(v) => update("assets", "stocks", v)} testId="input-stocks" />
      <NumInput label={t("fields.loans")} value={data.assets.loans} onChange={(v) => update("assets", "loans", v)} testId="input-loans" />
    </div>
  );
}
