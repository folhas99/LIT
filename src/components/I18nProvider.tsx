"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale, translate } from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${oneYear}; SameSite=Lax`;
}

export function I18nProvider({
  initialLocale,
  englishEnabled = true,
  children,
}: {
  initialLocale?: Locale;
  englishEnabled?: boolean;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(
    englishEnabled ? initialLocale ?? DEFAULT_LOCALE : DEFAULT_LOCALE
  );

  useEffect(() => {
    // If EN is disabled globally, force pt and clear any stale cookie.
    if (!englishEnabled) {
      if (locale !== DEFAULT_LOCALE) setLocaleState(DEFAULT_LOCALE);
      if (readCookie(LOCALE_COOKIE) && readCookie(LOCALE_COOKIE) !== DEFAULT_LOCALE) {
        writeCookie(LOCALE_COOKIE, DEFAULT_LOCALE);
      }
      return;
    }
    const cookieLocale = readCookie(LOCALE_COOKIE) as Locale | null;
    if (cookieLocale && cookieLocale !== locale) {
      setLocaleState(cookieLocale);
      return;
    }
    if (!cookieLocale && typeof navigator !== "undefined") {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) {
        setLocaleState("en");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [englishEnabled]);

  const setLocale = useCallback(
    (l: Locale) => {
      if (!englishEnabled && l !== DEFAULT_LOCALE) return;
      setLocaleState(l);
      writeCookie(LOCALE_COOKIE, l);
      if (typeof document !== "undefined") {
        document.documentElement.lang = l === "pt" ? "pt-PT" : "en";
      }
    },
    [englishEnabled]
  );

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string) => translate(DEFAULT_LOCALE, key),
    };
  }
  return ctx;
}
