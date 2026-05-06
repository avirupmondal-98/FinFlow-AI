import React from "react";
import { ShieldAlert } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Disclaimer({ open, onAccept, onClose }) {
  const { t } = useApp();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm animate-fade-up"
      data-testid="disclaimer-modal"
    >
      <div className="max-w-lg w-full glass rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="font-display font-black text-xl">{t("disclaimer.title")}</div>
        </div>
        <p className="text-[var(--muted-fg)] leading-relaxed text-sm">{t("disclaimer.body")}</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" data-testid="disclaimer-cancel-btn">
            {t("disclaimer.cancel")}
          </button>
          <button onClick={onAccept} className="btn-primary" data-testid="disclaimer-accept-btn">
            {t("disclaimer.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
