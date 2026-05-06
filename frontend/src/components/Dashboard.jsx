import React from "react";
import StatGrid from "./dashboard/StatGrid";
import HealthCard from "./dashboard/HealthCard";
import SummaryCard from "./dashboard/SummaryCard";
import GoalTimeline from "./dashboard/GoalTimeline";
import ActionChecklist from "./dashboard/ActionChecklist";
import PlanBody from "./dashboard/PlanBody";
import EmailCard from "./dashboard/EmailCard";
import DashboardActions from "./dashboard/DashboardActions";

export default function Dashboard({ plan, onReset }) {
  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-24" data-testid="dashboard">
      <DashboardActions plan={plan} onReset={onReset} />

      <StatGrid plan={plan} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <HealthCard plan={plan} />
        <SummaryCard plan={plan} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <GoalTimeline plan={plan} />
        <ActionChecklist plan={plan} />
      </div>

      <PlanBody plan={plan} />
      <EmailCard plan={plan} />
    </section>
  );
}
