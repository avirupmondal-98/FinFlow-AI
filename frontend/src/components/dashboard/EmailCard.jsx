import React, { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { emailPlan } from "../../lib/api";
import { useApp } from "../../context/AppContext";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function EmailCard({ plan }) {
  const { t } = useApp();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleEmail = async () => {
    if (!email || !EMAIL_RE.test(email)) {
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
        <button
          onClick={handleEmail}
          disabled={sending}
          className="btn-primary inline-flex items-center gap-2"
          data-testid="email-send-btn"
        >
          <Mail className="h-4 w-4" />
          {t("actions.email_send")}
        </button>
      </div>
    </div>
  );
}
