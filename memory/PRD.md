# FinFlow AI — Product Requirements

## Original Problem Statement
AI-powered financial planning web app called "FinFlow AI" with tagline "Your Smart Partner in Financial Growth". Premium fintech + playful (Groww-style) UI, glassmorphism, blue+teal gradient, mobile-first. Multi-step user input form (Personal, Income, Expenses, Assets & Liabilities, Goals). Animated cute dog AI pet during plan generation. Dashboard with income/expenses/savings/health score/goal timeline/AI plan/checklist. Floating "Pro Tip of the Day" glass card with shimmer + glow, new tip per generated plan. Download PDF, Send to Email, Reset Plan, Generate Plan buttons. EN↔HI language toggle, Dark/Light mode. Legal pages /privacy-policy and /terms-and-conditions. Footer with support@finflowai.com. Mandatory legal disclaimer before results. © 2026 FinFlow AI footer copy.

## User Choices
- LLM: Emergent LLM key, runtime toggle between **Claude Sonnet 4.5** (default) and **GPT-5.2**
- Email: SendGrid skipped for now → frontend shows "coming soon" toast; backend `/api/plan/email` returns `success:false` with the same message
- Currency: INR default
- AI pet: cute dog 🐶 (pure SVG + CSS keyframes — wagging tail, blinking eyes, soft bounce)

## Architecture
- Backend: FastAPI (`/app/backend/server.py`) using `emergentintegrations.LlmChat`. Endpoints under `/api`: `/`, `/tips/random`, `/plan/generate`, `/plan/email`. Mongo persists each plan in `plans` collection. LLM call wrapped in `asyncio.wait_for(50s)` so the preview edge never 502s.
- Frontend: React 18 + react-router-dom v6 + Tailwind. Single-page phase machine in `pages/Home.jsx` (landing → wizard → loading → dashboard). Pure SVG dog with CSS keyframes (`tailwind.config.js`).
- Storage: MongoDB (`finflow_ai` DB, `plans` collection).

## Personas
1. **Salaried professional in India (25-40)** — wants clarity on SIP allocation and goal feasibility.
2. **Young couple** — combined incomes, planning home + child education.
3. **Hindi-first user** — toggles UI to Hindi, gets the entire plan in Hindi.

## What's been implemented (2026-01-06)
- 5-step multi-step wizard with progress indicator, validation, EMI rows, multi-goal management.
- AI plan generation (Claude Sonnet 4.5 / GPT-5.2 toggle) with structured JSON contract & deterministic Hindi/English fallback.
- Dashboard: 4 stat cards, animated health score ring (color shifts by tier), AI summary, goal timeline with on-track/needs-push pills + progress bars, monthly action checklist, full markdown plan body, model + language chips.
- Animated cute dog SVG with wagging tail, blinking eyes, soft bounce. Used in landing preview, dashboard, and the full-screen pet loader overlay.
- Pet loader overlay with progress bar, particle backdrop, dynamic localized status text (analyzing → optimizing → ready).
- Pro Tip of the Day floating glass card with shimmer animation, glow pulse, dismiss; rotates each plan generation.
- Disclaimer modal (mandatory before results).
- PDF download via jsPDF (pagination, sections for snapshot/summary/plan/checklist/goals).
- Email UI shows "coming soon" toast (backend honestly returns the same).
- EN↔HI language toggle (full dictionary), Dark/Light theme toggle (next-themes-style via class).
- Legal pages `/privacy-policy` and `/terms-and-conditions` with full content.
- Footer with support email, legal links, copyright, "© 2026 FinFlow AI".
- Hero landing section with aurora + dotted backdrop, glassmorphic preview card, three feature cards.

## Backlog / Future
- **P1**: Activate SendGrid email when keys are provided.
- **P1**: Cache Hindi plan to reduce repeat LLM cost.
- **P2**: Save plans per-user (auth) so users can view history.
- **P2**: Side-by-side compare across two model runs.
- **P3**: Net-worth chart over time, scenario "what-if" sliders.
- **P3**: WhatsApp share + UPI auto-debit reminders.

## Code-Review Hardening (2026-01-06)
- **Security (XSS)**: Removed every `dangerouslySetInnerHTML` from the codebase. Markdown bold (`**text**`) is now rendered with pure React via `String.split` + `<strong>` nodes (`/app/frontend/src/lib/markdown.jsx`).
- **React hook deps**: `AppContext.jsx` now uses `useCallback` + `useMemo` for `toggleTheme`, `toggleLang`, `t`, `dict` (stable identities). `PetLoader.jsx` memoizes `steps[]` and lifts the particle config to module scope. `ProTip.jsx` split into two effects with clean dependency arrays.
- **Stable list keys**: EMI rows and goal rows in the wizard get a stable `id` on creation; checklist + goal-timeline keys now combine value + index to remain stable across reorderings.
- **Component decomposition**:
  - `Wizard.jsx` (310 lines) → `Wizard.jsx` ~110 lines + `wizard/{NumInput,WizardProgress,StepPersonal,StepIncome,StepExpenses,StepAssets,StepGoals}.jsx` + `hooks/useWizardState.js`.
  - `Dashboard.jsx` (318 lines) → `Dashboard.jsx` ~30 lines + `dashboard/{StatGrid,HealthCard,SummaryCard,GoalTimeline,ActionChecklist,PlanBody,EmailCard,DashboardActions}.jsx` + `lib/{pdf.js,markdown.jsx}`.
- **Inline object props**: `Toaster` `toastOptions` extracted to module-level constant in `App.js`.
- **Backend resilience**: `asyncio.wait_for(45s)` (was 50s) so the public response is always flushed within the 60s edge budget — fallback content is returned in time on slow Hindi/Claude calls.

All changes verified by testing agent iteration 3 (frontend 100% pass, all 50+ data-testids resolve, XSS regression confirmed closed).

## Iteration 4 — Single-Engine + Premium PDF (2026-01-06)
- **Removed Claude**, GPT-5.2 only. Backend `model_choice` is now `Literal["gpt-5.2"]` (rejects anything else with 422). Header dropdown shows only `GPT-5.2`. Default in `AppContext` flipped to `gpt-5.2`. Dashboard `model-used-chip` always reads `GPT-5.2`.
- **Premium colorful PDF** (`/app/frontend/src/lib/pdf.js` rewritten):
  - Captures live dashboard sections via `html2canvas` (`#pdf-stat-grid`, `#pdf-health-card`, `#pdf-goal-timeline`) and embeds them as JPEG images.
  - Brand-gradient header band (blue → teal), colored snapshot cards (per-metric accent dot), embedded "Live Dashboard" screenshot, large Health Score block (with native fallback ring if capture fails), boxed AI Summary, gradient Pro Tip card with pull-quote, Goal Timeline screenshot OR colored table fallback (with on-track/needs-push pills), Monthly Action Checklist with teal bullets, Detailed Plan (heading hierarchy preserved), italicized disclaimer, repeating brand footer with page numbers.
  - 4 pages, ~210 KB. Verified via AI document analyzer: "colorful, branded, and readable".
- Added export-loading state to `download-plan-btn` (`Preparing PDF…` with spinner).
- `html2canvas` added to dependencies via `yarn add`.
