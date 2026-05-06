import React, { useState } from "react";
import { Download, Mail, RotateCcw, CheckCircle2, ArrowUpRight, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import HealthRing from "./HealthRing";
import Dog from "./Dog";
import { useApp } from "../context/AppContext";
import { inr, shortInr } from "../lib/format";
import { emailPlan } from "../lib/api";
import jsPDF from "jspdf";

// Render a tiny slice of markdown safely: headings (##), bold (**), bullets (-), newlines.
function renderMarkdown(md) {
  if (!md) return null;
  const lines = md.split(/\r?\n/);
  const out = [];
  let listBuf = [];
  const flush = () => {
    if (listBuf.length) {
      out.push(<ul key={`ul-${out.length}`}>{listBuf}</ul>);
      listBuf = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      return;
    }
    if (line.startsWith("## ")) {
      flush();
      out.push(<h2 key={i}>{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      flush();
      out.push(<h3 key={i}>{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuf.push(<li key={i} dangerouslySetInnerHTML={{ __html: bold(line.slice(2)) }} />);
      return;
    }
    flush();
    out.push(<p key={i} dangerouslySetInnerHTML={{ __html: bold(line) }} />);
  });
  flush();
  return out;
}
function bold(s) {
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden" data-testid={`stat-${label.replace(/\s/g, "-").toLowerCase()}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted-fg)] font-bold">{label}</div>
        <div className={`h-9 w-9 rounded-xl grid place-items-center text-white ${accent}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 font-display font-black text-3xl leading-none">{value}</div>
    </div>
  );
}

export default function Dashboard({ plan, onReset }) {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleDownload = () => {
    try {
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
      const lines = doc.splitTextToSize(plainPlan, W - M * 2);
      lines.forEach((ln) => {
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
          const ln = doc.splitTextToSize(`• ${c}`, W - M * 2);
          ln.forEach((l) => {
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
          const wrapped = doc.splitTextToSize(`• ${ln}`, W - M * 2);
          wrapped.forEach((l) => {
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
      toast.success(t("dash.downloadDone"));
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    }
  };

  const handleEmail = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setSending(true);
    try {
      const res = await emailPlan(plan.id, email);
      toast.message(res.message || t("dash.emailSent"));
    } catch {
      toast.error("Could not send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-8 pb-24" data-testid="dashboard">
      {/* Header strip */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold">
            {t("dash.overview")}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight mt-1" data-testid="dashboard-title">
            Your plan, <span className="text-gradient">clear as day.</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2" data-testid="dashboard-actions">
          <button onClick={handleDownload} className="btn-primary inline-flex items-center gap-2" data-testid="download-plan-btn">
            <Download className="h-4 w-4" />
            {t("actions.download")}
          </button>
          <button onClick={onReset} className="btn-secondary inline-flex items-center gap-2" data-testid="reset-plan-btn">
            <RotateCcw className="h-4 w-4" />
            {t("actions.reset")}
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label={t("dash.income")} value={shortInr(plan.total_income)} accent="bg-gradient-to-br from-blue-600 to-teal-500" />
        <StatCard icon={<TrendingDown className="h-5 w-5" />} label={t("dash.expenses")} value={shortInr(plan.total_expenses)} accent="bg-gradient-to-br from-rose-500 to-amber-500" />
        <StatCard icon={<Wallet className="h-5 w-5" />} label={t("dash.savings")} value={shortInr(plan.monthly_savings)} accent="bg-gradient-to-br from-emerald-500 to-teal-500" />
        <StatCard icon={<ArrowUpRight className="h-5 w-5" />} label={t("dash.savingsRate")} value={`${plan.savings_rate}%`} accent="bg-gradient-to-br from-indigo-500 to-blue-500" />
      </div>

      {/* Row: Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="glass rounded-3xl p-6 flex flex-col items-center text-center lg:col-span-1 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="flex items-center gap-3 w-full">
            <Dog size={64} />
            <div className="text-left">
              <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold">
                {t("dash.score")}
              </div>
              <div className="font-display font-extrabold text-lg" data-testid="health-label">{plan.health_label}</div>
            </div>
          </div>
          <div className="mt-4">
            <HealthRing score={plan.financial_health_score} label={plan.health_label} />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-3">
            {t("dash.summary")}
          </div>
          <p className="text-lg leading-relaxed" data-testid="ai-summary">
            {plan.ai_summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 border border-[var(--border)]"
              data-testid="model-used-chip"
            >
              {plan.model_used === "claude-sonnet-4-5" ? "Claude Sonnet 4.5" : "GPT-5.2"}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/50 dark:bg-white/5 border border-[var(--border)]">
              {plan.language === "hi" ? "हिन्दी" : "English"}
            </span>
          </div>
        </div>
      </div>

      {/* Row: Goals + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="glass rounded-3xl p-6 lg:col-span-2" data-testid="goal-timeline">
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
            {t("dash.goals")}
          </div>
          {plan.goal_timeline?.length === 0 && (
            <div className="text-[var(--muted-fg)] italic">No goals added.</div>
          )}
          <div className="space-y-4">
            {plan.goal_timeline?.map((g, i) => {
              const desired = Math.max(1, Math.round(g.timeframe_years * 12));
              const progress = Math.min(100, Math.round((desired / Math.max(g.months_to_achieve, 1)) * 100));
              return (
                <div key={i} className="rounded-2xl bg-white/50 dark:bg-white/5 border border-[var(--border)] p-4" data-testid={`goal-item-${i}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-display font-extrabold text-lg">{g.name}</div>
                      <div className="text-xs text-[var(--muted-fg)] mt-0.5">
                        {inr(g.target_amount)} · {g.timeframe_years}y · {g.priority} priority
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        g.on_track
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500"
                      }`}
                    >
                      {g.on_track ? t("dash.onTrack") : t("dash.offTrack")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-200/60 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-teal-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--muted-fg)] whitespace-nowrap">
                      {inr(g.monthly_contribution)}/mo · {g.months_to_achieve} {t("dash.months")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-3xl p-6" data-testid="action-checklist">
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
            {t("dash.checklist")}
          </div>
          <ul className="space-y-3">
            {(plan.monthly_action_checklist || []).map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-[var(--border)]" data-testid={`checklist-${i}`}>
                <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plan body */}
      <div className="glass rounded-3xl p-6 sm:p-8 mt-5" data-testid="plan-body">
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-4">
          {t("dash.plan")}
        </div>
        <div className="plan-md">{renderMarkdown(plan.ai_plan_markdown)}</div>
      </div>

      {/* Email card */}
      <div className="glass rounded-3xl p-6 sm:p-8 mt-5" data-testid="email-card">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold mb-2">
              {t("actions.email_send")}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("actions.email_ph")}
              className="inp"
              data-testid="email-input"
            />
          </div>
          <button onClick={handleEmail} disabled={sending} className="btn-primary inline-flex items-center gap-2" data-testid="email-send-btn">
            <Mail className="h-4 w-4" />
            {t("actions.email_send")}
          </button>
        </div>
      </div>
    </section>
  );
}
