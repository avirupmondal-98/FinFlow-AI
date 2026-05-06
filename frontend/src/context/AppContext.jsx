import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DICT, t as translate } from "../lib/i18n";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("finflow-theme") || "light";
  });
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("finflow-lang") || "en";
  });
  const [model, setModel] = useState(() => {
    if (typeof window === "undefined") return "claude-sonnet-4-5";
    return localStorage.getItem("finflow-model") || "claude-sonnet-4-5";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("finflow-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("finflow-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("finflow-model", model);
  }, [model]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === "en" ? "hi" : "en")),
      model,
      setModel,
      t: (path) => translate(lang, path),
      dict: DICT[lang] || DICT.en,
    }),
    [theme, lang, model]
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
