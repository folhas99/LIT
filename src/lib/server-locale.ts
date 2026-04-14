import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n";
import {
  getSettings,
  getLocalizedSettings,
  isEnglishEnabled,
  type SiteSettings,
} from "@/lib/settings";

/**
 * Returns the active locale for the current request, honouring the
 * `localeEnabledEn` kill-switch: when English is disabled globally, this
 * always returns "pt" regardless of the cookie.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value as Locale | undefined;
  const desired: Locale = raw && LOCALES.includes(raw) ? raw : DEFAULT_LOCALE;

  if (desired === "pt") return "pt";
  try {
    const base = await getSettings();
    return isEnglishEnabled(base) ? "en" : "pt";
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Convenience helper: returns both the current locale and a settings object
 * already resolved to that locale.
 */
export async function getLocaleAndSettings(): Promise<{
  locale: Locale;
  settings: SiteSettings;
  englishEnabled: boolean;
}> {
  const locale = await getServerLocale();
  const base = await getSettings();
  const englishEnabled = isEnglishEnabled(base);
  const settings = locale === "en" ? await getLocalizedSettings("en") : base;
  return { locale, settings, englishEnabled };
}
