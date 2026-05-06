import React from "react";
import { ArrowUpRight, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { shortInr } from "../../lib/format";
import { useApp } from "../../context/AppContext";

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="glass rounded-2xl p-5 relative overflow-hidden"
      data-testid={`stat-${label.replace(/\s/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted-fg)] font-bold">{label}</div>
        <div className={`h-9 w-9 rounded-xl grid place-items-center text-white ${accent}`}>{icon}</div>
      </div>
      <div className="mt-4 font-display font-black text-3xl leading-none">{value}</div>
    </div>
  );
}

export default function StatGrid({ plan }) {
  const { t } = useApp();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label={t("dash.income")}
        value={shortInr(plan.total_income)}
        accent="bg-gradient-to-br from-blue-600 to-teal-500"
      />
      <StatCard
        icon={<TrendingDown className="h-5 w-5" />}
        label={t("dash.expenses")}
        value={shortInr(plan.total_expenses)}
        accent="bg-gradient-to-br from-rose-500 to-amber-500"
      />
      <StatCard
        icon={<Wallet className="h-5 w-5" />}
        label={t("dash.savings")}
        value={shortInr(plan.monthly_savings)}
        accent="bg-gradient-to-br from-emerald-500 to-teal-500"
      />
      <StatCard
        icon={<ArrowUpRight className="h-5 w-5" />}
        label={t("dash.savingsRate")}
        value={`${plan.savings_rate}%`}
        accent="bg-gradient-to-br from-indigo-500 to-blue-500"
      />
    </div>
  );
}
