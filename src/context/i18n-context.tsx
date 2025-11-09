'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import en from '@/lib/locales/en.json';
import es from '@/lib/locales/es.json';

type Locale = 'en' | 'es';

const translations = { en, es };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, values?: Record<string, any>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('es');

  const t = (key: string, values?: Record<string, any>): string => {
    let translation = translations[locale][key as keyof typeof translations[Locale]] || key;
    if (values) {
        Object.keys(values).forEach(k => {
            translation = translation.replace(`{${k}}`, values[k]);
        })
    }
    return translation;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
