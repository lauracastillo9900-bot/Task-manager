'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'es';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const translations: Record<Locale, Record<string, unknown>> = {
  en: {},
  es: {},
};

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === 'string' ? current : path;
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale === 'en' || savedLocale === 'es') {
    return savedLocale;
  }

  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'es') return 'es';

  return 'en';
}

async function loadTranslations(locale: Locale) {
  if (Object.keys(translations[locale]).length === 0) {
    const messages = await import(`@/messages/${locale}.json`);
    translations[locale] = messages.default;
  }
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
};

export { type Locale };

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTranslations(locale).then(() => setIsLoaded(true));
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    return getNestedValue(translations[locale] as Record<string, unknown>, key);
  };

  if (!isLoaded) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, setLocale } = useLocale();
  return { t, locale, setLocale, localeNames };
}
