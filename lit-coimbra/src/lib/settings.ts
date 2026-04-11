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
};

const defaults: SiteSettings = {
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
