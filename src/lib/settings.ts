import { prisma } from "./prisma";

export type SiteSettings = {
  siteName: string;
  siteDescription: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  schedule: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroVideo: string;
  sectionEvents: string;
  sectionGallery: string;
  sectionReservations: string;
  sectionAbout: string;
  sectionContact: string;
  themeColorPrimary: string;
  themeColorAccent: string;
  themeColorAccentPurple: string;
  themeColorAccentPink: string;
  themeColorAccentBlue: string;
  themeColorAccentGold: string;
  themeColorBackground: string;
  themeColorSurface: string;
  themeColorText: string;
  themeColorTextMuted: string;
  themeFontHeading: string;
  themeFontBody: string;
  themeAnimations: string;
  themeParticles: string;
  // Visual element tokens — buttons
  themeButtonRadius: string; // px
  themeButtonPaddingX: string; // px
  themeButtonPaddingY: string; // px
  themeButtonFontWeight: string; // 400-700
  themeButtonTextTransform: string; // "uppercase" | "none"
  themeButtonLetterSpacing: string; // em e.g. "0.05"
  themeButtonPrimaryBg: string;
  themeButtonPrimaryText: string;
  themeButtonPrimaryHoverBg: string;
  themeButtonSecondaryBg: string;
  themeButtonSecondaryText: string;
  themeButtonSecondaryBorder: string;
  themeButtonSecondaryHoverBg: string;
  themeButtonGhostText: string;
  themeButtonGhostHoverBg: string;
  // Visual element tokens — cards
  themeCardRadius: string; // px
  themeCardBg: string;
  themeCardBorderColor: string;
  themeCardBorderWidth: string; // px
  themeCardShadow: string; // "none" | "soft" | "medium" | "glow"
  // Visual element tokens — inputs
  themeInputRadius: string; // px
  themeInputBg: string;
  themeInputBorderColor: string;
  themeInputText: string;
  themeInputFocusColor: string;
  contentHeroTitle: string;
  contentHeroSubtitle: string;
  contentHeroCTA1Text: string;
  contentHeroCTA2Text: string;
  contentAboutTitle: string;
  contentAboutText1: string;
  contentAboutText2: string;
  contentContactTitle: string;
  contentContactText: string;
  contentReservasTitle: string;
  contentReservasText: string;
  contentEventsTitle: string;
  contentGaleriaTitle: string;
  contentFooterText: string;
  faviconUrl: string;
  logoUrl: string;
  analyticsPlausibleDomain: string;
  analyticsPlausibleScript: string;
  localeEnabledEn: string; // "true" | "false"
  scheduleHours: string; // JSON: { mon: null | [open, close], tue: ..., ... } time as "HH:MM"
  mapLatitude: string;
  mapLongitude: string;
};

export const defaults: SiteSettings = {
  siteName: "LIT Coimbra",
  siteDescription: "A tua nova casa! Discoteca em Coimbra.",
  address: "Coimbra, Portugal",
  phone: "",
  email: "info@litcoimbra.pt",
  instagram: "https://www.instagram.com/lit.coimbra/",
  facebook: "",
  tiktok: "",
  schedule: "Quarta a Sábado, 23:00 - 06:00",
  heroTitle: "LIT Coimbra",
  heroSubtitle: "A tua nova casa",
  heroImage: "",
  heroVideo: "",
  sectionEvents: "true",
  sectionGallery: "true",
  sectionReservations: "true",
  sectionAbout: "true",
  sectionContact: "true",
  themeColorPrimary: "#4a7c59",
  themeColorAccent: "#39FF14",
  themeColorAccentPurple: "#a855f7",
  themeColorAccentPink: "#e84393",
  themeColorAccentBlue: "#0984e3",
  themeColorAccentGold: "#d4a017",
  themeColorBackground: "#0a1f0f",
  themeColorSurface: "#0f2d16",
  themeColorText: "#ffffff",
  themeColorTextMuted: "#9ca3af",
  themeFontHeading: "Inter",
  themeFontBody: "Inter",
  themeAnimations: "true",
  themeParticles: "true",
  themeButtonRadius: "2",
  themeButtonPaddingX: "32",
  themeButtonPaddingY: "12",
  themeButtonFontWeight: "600",
  themeButtonTextTransform: "uppercase",
  themeButtonLetterSpacing: "0.1",
  themeButtonPrimaryBg: "#2d5a27",
  themeButtonPrimaryText: "#ffffff",
  themeButtonPrimaryHoverBg: "#4a8c3f",
  themeButtonSecondaryBg: "transparent",
  themeButtonSecondaryText: "#ffffff",
  themeButtonSecondaryBorder: "#ffffff33",
  themeButtonSecondaryHoverBg: "#ffffff10",
  themeButtonGhostText: "#39FF14",
  themeButtonGhostHoverBg: "#39FF1420",
  themeCardRadius: "2",
  themeCardBg: "#0f2d16",
  themeCardBorderColor: "#1a2a1a",
  themeCardBorderWidth: "1",
  themeCardShadow: "soft",
  themeInputRadius: "2",
  themeInputBg: "#0a1f0f",
  themeInputBorderColor: "#1a2a1a",
  themeInputText: "#ffffff",
  themeInputFocusColor: "#4a8c3f",
  contentHeroTitle: "LIT Coimbra",
  contentHeroSubtitle: "A tua nova casa",
  contentHeroCTA1Text: "Reservar Mesa",
  contentHeroCTA2Text: "Ver Eventos",
  contentAboutTitle: "Sobre",
  contentAboutText1: "O LIT Coimbra \u00e9 o espa\u00e7o onde a noite ganha vida. Um ambiente \u00fanico onde a m\u00fasica, as pessoas e a energia se encontram para criar noites inesquec\u00edveis.",
  contentAboutText2: "Inspirado pela natureza e pela ess\u00eancia da vida noturna, o LIT \u00e9 a tua nova casa em Coimbra. Um espa\u00e7o decorado com elementos naturais que cria uma atmosfera acolhedora e ao mesmo tempo vibrante.",
  contentContactTitle: "Fala connosco",
  contentContactText: "Tens alguma quest\u00e3o ou sugest\u00e3o? Entra em contacto atrav\u00e9s dos seguintes meios.",
  contentReservasTitle: "Reserva VIP",
  contentReservasText: "Garante a tua mesa e vive a melhor experi\u00eancia no LIT Coimbra.",
  contentEventsTitle: "Eventos",
  contentGaleriaTitle: "Galeria",
  contentFooterText: "A tua nova casa em Coimbra.",
  faviconUrl: "",
  logoUrl: "",
  analyticsPlausibleDomain: "",
  analyticsPlausibleScript: "https://plausible.io/js/script.js",
  localeEnabledEn: "true",
  // Default: Wed-Sat 23:00-06:00
  scheduleHours: JSON.stringify({
    mon: null,
    tue: null,
    wed: ["23:00", "06:00"],
    thu: ["23:00", "06:00"],
    fri: ["23:00", "06:00"],
    sat: ["23:00", "06:00"],
    sun: null,
  }),
  // Coimbra city center default coordinates
  mapLatitude: "40.2111",
  mapLongitude: "-8.4292",
};

export async function getSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  return { ...defaults, ...map } as SiteSettings;
}

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? (defaults as Record<string, string>)[key] ?? "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export function isSectionEnabled(
  settings: SiteSettings,
  section: keyof SiteSettings
): boolean {
  return settings[section] !== "false";
}

/**
 * Set of SiteSettings keys that represent user-facing textual content that
 * can be translated. The corresponding EN value is stored under `${key}__en`.
 */
export const TRANSLATABLE_SETTING_KEYS = [
  "siteName",
  "siteDescription",
  "heroTitle",
  "heroSubtitle",
  "schedule",
  "contentHeroTitle",
  "contentHeroSubtitle",
  "contentHeroCTA1Text",
  "contentHeroCTA2Text",
  "contentAboutTitle",
  "contentAboutText1",
  "contentAboutText2",
  "contentContactTitle",
  "contentContactText",
  "contentReservasTitle",
  "contentReservasText",
  "contentEventsTitle",
  "contentGaleriaTitle",
  "contentFooterText",
] as const satisfies readonly (keyof SiteSettings)[];

export type TranslatableSettingKey = (typeof TRANSLATABLE_SETTING_KEYS)[number];

export function enSettingKey(key: TranslatableSettingKey): string {
  return `${key}__en`;
}

export function isEnglishEnabled(settings: SiteSettings): boolean {
  return settings.localeEnabledEn !== "false";
}

/**
 * Returns a SiteSettings object where translatable keys are resolved to the
 * English value when `locale === "en"` and an EN override exists; otherwise
 * falls back to the Portuguese value.
 */
export async function getLocalizedSettings(
  locale: "pt" | "en"
): Promise<SiteSettings> {
  const base = await getSettings();
  if (locale !== "en" || !isEnglishEnabled(base)) return base;

  const enRows = await prisma.siteSetting.findMany({
    where: { key: { in: TRANSLATABLE_SETTING_KEYS.map((k) => enSettingKey(k)) } },
  });
  const enMap = new Map(enRows.map((r) => [r.key, r.value] as const));

  const out: SiteSettings = { ...base };
  for (const k of TRANSLATABLE_SETTING_KEYS) {
    const v = enMap.get(enSettingKey(k));
    if (v && v.trim()) (out as Record<string, string>)[k] = v;
  }
  return out;
}

/**
 * Given an Event-like or Gallery-like record with both PT and EN variants,
 * pick the EN value when locale === "en" and it's non-empty, else PT.
 */
export function pickLocalized<T extends { [key: string]: unknown }>(
  record: T,
  field: string,
  locale: "pt" | "en"
): string {
  const pt = (record[field] as string | null | undefined) ?? "";
  if (locale !== "en") return pt;
  const en = (record[`${field}En`] as string | null | undefined) ?? "";
  return en.trim() ? en : pt;
}
