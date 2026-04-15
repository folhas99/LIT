import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { defaultSectionsFor } from "../src/lib/page-defaults";

const prisma = new PrismaClient();

export { defaultSectionsFor };

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
