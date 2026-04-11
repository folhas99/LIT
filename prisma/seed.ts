import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  console.log("Seed completed: admin user + default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
