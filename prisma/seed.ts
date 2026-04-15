import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Default section layouts for each system page. Only inserted if the page has
 *  no sections yet — existing installations keep their current content. */
function defaultSectionsFor(slug: string): Array<{
  type: string;
  content: Record<string, unknown>;
  order: number;
  spacing?: Record<string, unknown>;
}> {
  switch (slug) {
    case "homepage":
      return [
        { type: "hero_home", content: {}, order: 0, spacing: { fullBleed: true } },
        { type: "next_event_countdown", content: {}, order: 1, spacing: { paddingTop: 80, paddingBottom: 80 } },
        { type: "events_preview", content: { limit: 4 }, order: 2, spacing: { paddingTop: 80, paddingBottom: 80 } },
        { type: "galleries_preview", content: { limit: 6 }, order: 3, spacing: { paddingTop: 80, paddingBottom: 80 } },
        { type: "contact_cta", content: {}, order: 4, spacing: { paddingTop: 80, paddingBottom: 80 } },
      ];
    case "eventos":
      return [
        { type: "page_header", content: { title: "Eventos", titleEn: "Events", subtitle: "Todas as noites no LIT.", subtitleEn: "Every night at LIT." }, order: 0, spacing: { paddingTop: 96, paddingBottom: 32 } },
        { type: "events_grid", content: {}, order: 1, spacing: { paddingBottom: 96 } },
      ];
    case "galeria":
      return [
        { type: "page_header", content: { title: "Galeria", titleEn: "Gallery", subtitle: "Momentos de cada noite.", subtitleEn: "Memories from every night.", accent: "purple" }, order: 0, spacing: { paddingTop: 96, paddingBottom: 32 } },
        { type: "galleries_grid", content: {}, order: 1, spacing: { paddingBottom: 96 } },
      ];
    case "reservas":
      return [
        { type: "reservation_form", content: { showEventSelector: true, showHeader: true }, order: 0, spacing: { paddingTop: 96, paddingBottom: 96 } },
      ];
    case "sobre":
      return [
        { type: "page_header", content: { title: "Sobre", titleEn: "About", subtitle: "A tua nova casa em Coimbra.", subtitleEn: "Your new home in Coimbra." }, order: 0, spacing: { paddingTop: 96, paddingBottom: 32 } },
        {
          type: "text",
          content: {
            title: "A nossa história",
            titleEn: "Our story",
            body: "O LIT nasce em Coimbra como espaço dedicado à música, à noite e aos encontros que ficam.",
            bodyEn: "LIT is born in Coimbra as a space dedicated to music, nightlife and unforgettable encounters.",
            alignment: "left",
          },
          order: 1,
          spacing: { paddingBottom: 48 },
        },
        {
          type: "info_cards",
          content: {
            title: "Informações úteis",
            titleEn: "Useful info",
            columns: 3,
            items: [
              { icon: "mapPin", title: "Morada", titleEn: "Address", text: "Coimbra, Portugal", textEn: "Coimbra, Portugal" },
              { icon: "clock", title: "Horário", titleEn: "Hours", text: "Qua–Sáb · 23:00 – 06:00", textEn: "Wed–Sat · 11:00 PM – 6:00 AM" },
              { icon: "crown", title: "Reservas VIP", titleEn: "VIP Bookings", text: "Mesa reservada à distância de um clique.", textEn: "Reserve your table in one click.", link: "/reservas" },
            ],
          },
          order: 2,
          spacing: { paddingBottom: 96 },
        },
      ];
    case "contacto":
      return [
        { type: "page_header", content: { title: "Contacto", titleEn: "Contact", subtitle: "Fala connosco.", subtitleEn: "Get in touch." }, order: 0, spacing: { paddingTop: 96, paddingBottom: 32 } },
        { type: "contact_info", content: {}, order: 1, spacing: { paddingBottom: 48 } },
        { type: "contact_form", content: { title: "Envia-nos uma mensagem", titleEn: "Send us a message" }, order: 2, spacing: { paddingBottom: 48 } },
        { type: "contact_map", content: {}, order: 3, spacing: { paddingBottom: 96 } },
      ];
    default:
      return [];
  }
}

const systemPages = [
  { slug: "homepage", title: "Homepage", titleEn: "Homepage", navLabel: "Início", navLabelEn: "Home", navOrder: 0, showInNav: false },
  { slug: "eventos", title: "Eventos", titleEn: "Events", navLabel: "Eventos", navLabelEn: "Events", navOrder: 10, showInNav: true },
  { slug: "galeria", title: "Galeria", titleEn: "Gallery", navLabel: "Galeria", navLabelEn: "Gallery", navOrder: 20, showInNav: true },
  { slug: "reservas", title: "Reservas", titleEn: "Reservations", navLabel: "Reservas", navLabelEn: "Reservations", navOrder: 30, showInNav: true },
  { slug: "sobre", title: "Sobre", titleEn: "About", navLabel: "Sobre", navLabelEn: "About", navOrder: 40, showInNav: true },
  { slug: "contacto", title: "Contacto", titleEn: "Contact", navLabel: "Contacto", navLabelEn: "Contact", navOrder: 50, showInNav: true },
];

async function main() {
  const hashedPassword = await bcrypt.hash("Ftiago@90", 12);

  await prisma.user.upsert({
    where: { email: "admin@litcoimbra.pt" },
    update: {},
    create: {
      email: "admin@litcoimbra.pt",
      password: hashedPassword,
      name: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  const defaultSettings = [
    { key: "siteName", value: "LIT Coimbra" },
    { key: "siteDescription", value: "A tua nova casa! Discoteca em Coimbra." },
    { key: "address", value: "Coimbra, Portugal" },
    { key: "email", value: "info@litcoimbra.pt" },
    { key: "instagram", value: "https://www.instagram.com/lit.coimbra/" },
    { key: "schedule", value: "Quarta a Sábado, 23:00 - 06:00" },
    { key: "heroTitle", value: "LIT Coimbra" },
    { key: "heroSubtitle", value: "A tua nova casa" },
    { key: "sectionEvents", value: "true" },
    { key: "sectionGallery", value: "true" },
    { key: "sectionReservations", value: "true" },
    { key: "sectionAbout", value: "true" },
    { key: "sectionContact", value: "true" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // ------------------------------------------------------------------
  // System pages — upsert metadata + populate default sections only when
  // the page is empty. This way a fresh install gets a usable layout,
  // while existing installations keep whatever sections they already have.
  // ------------------------------------------------------------------
  for (const p of systemPages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {
        // Don't force-overwrite titles in existing installs, but ensure the
        // system flag + nav defaults are consistent.
        system: true,
      },
      create: {
        slug: p.slug,
        title: p.title,
        titleEn: p.titleEn,
        navLabel: p.navLabel,
        navLabelEn: p.navLabelEn,
        navOrder: p.navOrder,
        showInNav: p.showInNav,
        system: true,
        published: true,
      },
    });

    const existingCount = await prisma.pageSection.count({ where: { page: p.slug } });
    if (existingCount === 0) {
      const defaults = defaultSectionsFor(p.slug);
      for (const section of defaults) {
        await prisma.pageSection.create({
          data: {
            page: p.slug,
            type: section.type,
            content: JSON.stringify(section.content),
            spacing: section.spacing ? JSON.stringify(section.spacing) : null,
            order: section.order,
            visible: true,
          },
        });
      }
      if (defaults.length > 0) {
        console.log(`Seeded ${defaults.length} default sections for /${p.slug}`);
      }
    }
  }

  console.log("Seed completed: admin user, settings, system pages");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
