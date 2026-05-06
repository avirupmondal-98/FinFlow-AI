import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-fg)] hover:text-[var(--fg)]" data-testid="back-home">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <div className="flex items-center gap-3 mt-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 grid place-items-center text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-display font-black text-4xl tracking-tight">Privacy Policy</h1>
      </div>
      <div className="prose-md mt-8 space-y-5 text-[var(--muted-fg)] leading-relaxed">
        <p>
          We collect user-provided financial and personal information only to
          generate AI-based financial plans.
        </p>
        <p>We do not sell, share, or misuse your data.</p>
        <p>
          Data may be processed using third-party services such as AI APIs and
          automation tools.
        </p>
        <p>
          We take reasonable steps to protect your data, but we cannot guarantee
          absolute security.
        </p>
        <p>By using this platform, you agree to this policy.</p>
        <p>
          For concerns, contact{" "}
          <a className="text-teal-500 font-semibold" href="mailto:support@finflowai.com">
            support@finflowai.com
          </a>
          .
        </p>
        <h2 className="font-display text-2xl font-extrabold text-[var(--fg)] mt-8">What we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>User input financial data (income, expenses, savings, goals).</li>
          <li>Email address (only if provided to receive your plan).</li>
          <li>Anonymous usage diagnostics to improve reliability.</li>
        </ul>
        <h2 className="font-display text-2xl font-extrabold text-[var(--fg)] mt-8">How we use it</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Generating personalised financial guidance.</li>
          <li>Processing via AI APIs and automation tools only for your request.</li>
          <li>No data is sold to advertisers or third parties.</li>
        </ul>
      </div>
    </section>
  );
}
