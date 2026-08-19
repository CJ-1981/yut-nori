'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, translations, TranslationKey } from './translations';

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'yutnori-lang';

// Always render the same language on the server AND during the first client
// render to avoid React hydration mismatches. The saved language (if any) is
// applied in a useEffect AFTER hydration completes.
const SSR_DEFAULT_LANG: Language = 'en';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(SSR_DEFAULT_LANG);

  // After hydration, sync from localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['en', 'ko', 'ja', 'zh'].includes(saved)) {
        queueMicrotask(() => {
          setLangState(saved as Language);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  }, []);

  const tFn = useCallback((key: TranslationKey) => translations[lang][key] ?? key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
