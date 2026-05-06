import jsPDF from "jspdf";
import { inr } from "./format";

export function exportPlanPdf(plan) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 60;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("FinFlow AI — Financial Plan", M, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Generated ${new Date(plan.created_at).toLocaleString("en-IN")}`, M, y);
  y += 10;
  doc.text(`Model: ${plan.model_used}`, M, y);
  y += 24;

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Snapshot", M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const snapshot = [
    `Total Income: ${inr(plan.total_income)}`,
    `Total Expenses: ${inr(plan.total_expenses)}`,
    `Monthly Savings: ${inr(plan.monthly_savings)}`,
    `Savings Rate: ${plan.savings_rate}%`,
    `Financial Health Score: ${plan.financial_health_score} (${plan.health_label})`,
  ];
  snapshot.forEach((s) => {
    doc.text(s, M, y);
    y += 14;
  });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("AI Summary", M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const sum = doc.splitTextToSize(plan.ai_summary || "", W - M * 2);
  doc.text(sum, M, y);
  y += sum.length * 14 + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Plan", M, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const plainPlan = (plan.ai_plan_markdown || "").replace(/\*\*/g, "");
  doc.splitTextToSize(plainPlan, W - M * 2).forEach((ln) => {
    if (y > 780) {
      doc.addPage();
      y = 60;
    }
    doc.text(ln, M, y);
    y += 14;
  });

  if (plan.monthly_action_checklist?.length) {
    if (y > 740) {
      doc.addPage();
      y = 60;
    }
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Monthly Action Checklist", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    plan.monthly_action_checklist.forEach((c) => {
      doc.splitTextToSize(`• ${c}`, W - M * 2).forEach((l) => {
        if (y > 780) {
          doc.addPage();
          y = 60;
        }
        doc.text(l, M, y);
        y += 14;
      });
    });
  }

  if (plan.goal_timeline?.length) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Goal Timeline", M, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    plan.goal_timeline.forEach((g) => {
      const ln = `${g.name} — ${inr(g.target_amount)} in ${g.timeframe_years}y · ${inr(g.monthly_contribution)}/mo · ${g.months_to_achieve} months`;
      doc.splitTextToSize(`• ${ln}`, W - M * 2).forEach((l) => {
        if (y > 780) {
          doc.addPage();
          y = 60;
        }
        doc.text(l, M, y);
        y += 14;
      });
    });
  }

  doc.save(`FinFlow-Plan-${plan.id.slice(0, 8)}.pdf`);
}
