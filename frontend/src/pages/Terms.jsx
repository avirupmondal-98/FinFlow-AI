import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-8 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-fg)] hover:text-[var(--fg)]" data-testid="back-home">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <div className="flex items-center gap-3 mt-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 grid place-items-center text-white">
          <FileText className="h-5 w-5" />
        </div>
        <h1 className="font-display font-black text-4xl tracking-tight">Terms & Conditions</h1>
      </div>
      <div className="mt-8 space-y-5 text-[var(--muted-fg)] leading-relaxed">
        <p>
          FinFlow AI provides AI-generated financial guidance for informational
          purposes only.
        </p>
        <p>We do not provide professional financial, legal, or investment advice.</p>
        <p>Users are solely responsible for their financial decisions.</p>
        <p>
          We are not liable for any financial loss, damages, or outcomes resulting
          from use of this platform.
        </p>
        <p>We reserve the right to modify or discontinue the service at any time.</p>
        <p>By using this platform, you agree to these terms.</p>
        <h2 className="font-display text-2xl font-extrabold text-[var(--fg)] mt-8">Limitation of Liability</h2>
        <p>
          Under no circumstance shall FinFlow AI, its affiliates or employees be
          liable for indirect, incidental, special, consequential or punitive damages
          arising out of or relating to your use of the platform.
        </p>
        <h2 className="font-display text-2xl font-extrabold text-[var(--fg)] mt-8">Service Availability</h2>
        <p>
          The service is provided on an "as-is" and "as-available" basis without any
          warranties. We may introduce, change or discontinue features without notice.
        </p>
      </div>
    </section>
  );
}
