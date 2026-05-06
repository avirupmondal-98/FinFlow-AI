import React from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck, FileText, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-24 relative" data-testid="site-footer">
      <div className="bg-[#0B0F19] text-slate-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 grid place-items-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="font-display text-2xl font-black text-white">{t("brand")}</div>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">{t("tagline")}.</p>
            <p className="text-slate-500 mt-5 text-sm max-w-md">{t("footer.help")}</p>
            <a
              href="mailto:support@finflowai.com"
              className="inline-flex items-center gap-2 mt-4 text-teal-400 hover:text-teal-300 font-semibold"
              data-testid="footer-contact-email"
            >
              <Mail className="h-4 w-4" />
              support@finflowai.com
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold mb-4">
              {t("footer.contact")}
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@finflowai.com"
                  className="hover:text-white transition"
                  data-testid="footer-link-contact"
                >
                  support@finflowai.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold mb-4">Legal</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition inline-flex items-center gap-2"
                  data-testid="footer-link-privacy"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-conditions"
                  className="hover:text-white transition inline-flex items-center gap-2"
                  data-testid="footer-link-terms"
                >
                  <FileText className="h-4 w-4" />
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
            <div>© 2026 FinFlow AI. {t("footer.rights")}</div>
            <div className="max-w-xl sm:text-right">{t("footer.copy")}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
