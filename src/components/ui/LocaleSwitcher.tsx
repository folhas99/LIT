"use client";

import { useI18n } from "@/components/I18nProvider";
import type { Locale } from "@/lib/i18n";

export default function LocaleSwitcher({
  className = "",
  enabled = true,
}: {
  className?: string;
  enabled?: boolean;
}) {
  const { locale, setLocale } = useI18n();

  if (!enabled) return null;

  const handleClick = (l: Locale) => {
    if (l === locale) return;
    setLocale(l);
  };

  return (
    <div
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${className}`}
      role="group"
      aria-label="Idioma"
    >
      <button
        type="button"
        onClick={() => handleClick("pt")}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${
          locale === "pt" ? "text-neon-green" : "text-gray-500 hover:text-gray-300"
        }`}
        aria-pressed={locale === "pt"}
      >
        PT
      </button>
      <span className="text-gray-700">/</span>
      <button
        type="button"
        onClick={() => handleClick("en")}
        className={`px-1.5 py-0.5 rounded-sm transition-colors ${
          locale === "en" ? "text-neon-green" : "text-gray-500 hover:text-gray-300"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
