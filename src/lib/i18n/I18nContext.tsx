'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, translations, TranslationKey } from './translations';

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'yutnori-lang';

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['en', 'ko', 'ja', 'zh'].includes(saved)) {
      return saved as Language;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

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
