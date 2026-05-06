import React from "react";
import { Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { exportPlanPdf } from "../../lib/pdf";
import { useApp } from "../../context/AppContext";

export default function DashboardActions({ plan, onReset }) {
  const { t } = useApp();

  const handleDownload = () => {
    try {
      exportPlanPdf(plan);
      toast.success(t("dash.downloadDone"));
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-fg)] font-bold">
          {t("dash.overview")}
        </div>
        <h1
          className="font-display font-black text-3xl sm:text-4xl tracking-tight mt-1"
          data-testid="dashboard-title"
        >
          Your plan, <span className="text-gradient">clear as day.</span>
        </h1>
      </div>
      <div className="flex flex-wrap gap-2" data-testid="dashboard-actions">
        <button
          onClick={handleDownload}
          className="btn-primary inline-flex items-center gap-2"
          data-testid="download-plan-btn"
        >
          <Download className="h-4 w-4" />
          {t("actions.download")}
        </button>
        <button
          onClick={onReset}
          className="btn-secondary inline-flex items-center gap-2"
          data-testid="reset-plan-btn"
        >
          <RotateCcw className="h-4 w-4" />
          {t("actions.reset")}
        </button>
      </div>
    </div>
  );
}
