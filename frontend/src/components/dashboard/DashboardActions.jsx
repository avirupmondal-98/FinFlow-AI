import React, { useState } from "react";
import { Download, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportPlanPdf } from "../../lib/pdf";
import { useApp } from "../../context/AppContext";

export default function DashboardActions({ plan, onReset }) {
  const { t } = useApp();
  const [exporting, setExporting] = useState(false);

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportPlanPdf(plan);
      toast.success(t("dash.downloadDone"));
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    } finally {
      setExporting(false);
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
          disabled={exporting}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-70"
          data-testid="download-plan-btn"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin-slow" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "Preparing PDF…" : t("actions.download")}
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
