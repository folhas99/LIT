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
