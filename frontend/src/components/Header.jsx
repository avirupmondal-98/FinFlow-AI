import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Header({ onReset }) {
  const { theme, toggleTheme, lang, toggleLang, model, setModel, t } = useApp();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(255,255,255,0.55)] dark:bg-[rgba(11,15,25,0.55)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          onClick={() => onReset && onReset()}
          className="flex items-center gap-2 group"
          data-testid="brand-logo"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 grid place-items-center shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="leading-none">
            <div className="font-display font-extrabold text-lg tracking-tight">{t("brand")}</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-fg)] mt-1 hidden sm:block">
              {t("tagline")}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="hidden md:block text-xs font-semibold px-3 py-2 rounded-full border border-[var(--border)] bg-white/60 dark:bg-white/5"
            data-testid="model-select"
            title={t("modelLabel")}
          >
            <option value="gpt-5.2">GPT-5.2</option>
          </select>

          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border border-[var(--border)] bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 transition"
            data-testid="language-toggle-btn"
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" />
            <span>{lang === "en" ? "EN" : "HI"}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="h-9 w-9 grid place-items-center rounded-full border border-[var(--border)] bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 transition"
            data-testid="theme-toggle-btn"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
