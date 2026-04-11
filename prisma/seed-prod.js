// Production seed script - runs after migrations
// Creates admin user and default site settings
const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@litcoimbra.pt" },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Ftiago@90", 12);
      await prisma.user.create({
        data: {
          email: "admin@litcoimbra.pt",
          password: hashedPassword,
          name: "Admin",
          role: "SUPER_ADMIN",
        },
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists, skipping");
    }

    // Seed default settings
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
      const existing = await prisma.siteSetting.findUnique({
        where: { key: setting.key },
      });
      if (!existing) {
        await prisma.siteSetting.create({ data: setting });
      }
    }

    console.log("Seed completed: admin user + default settings ready");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
