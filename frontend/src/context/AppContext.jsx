import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT, t as translate } from "../lib/i18n";

const AppCtx = createContext(null);

const THEME_KEY = "finflow-theme";
const LANG_KEY = "finflow-lang";
const MODEL_KEY = "finflow-model";

function readStored(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy-mode failures */
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => readStored(THEME_KEY, "light"));
  const [lang, setLang] = useState(() => readStored(LANG_KEY, "en"));
  const [model, setModel] = useState(() => readStored(MODEL_KEY, "gpt-5.2"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeStored(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    writeStored(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    writeStored(MODEL_KEY, model);
  }, [model]);

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );
  const toggleLang = useCallback(
    () => setLang((prev) => (prev === "en" ? "hi" : "en")),
    []
  );

  // Translator depends only on `lang` — the dictionary is a stable module import.
  const t = useCallback((path) => translate(lang, path), [lang]);
  const dict = useMemo(() => DICT[lang] || DICT.en, [lang]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, lang, setLang, toggleLang, model, setModel, t, dict }),
    [theme, lang, model, toggleTheme, toggleLang, t, dict]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
