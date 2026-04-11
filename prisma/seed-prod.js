// Production seed script - uses pg directly (no Prisma client needed)
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check if admin user already exists
    const { rows: existingUsers } = await pool.query(
      'SELECT id FROM "User" WHERE email = $1',
      ["admin@litcoimbra.pt"]
    );

    if (existingUsers.length === 0) {
      const hashedPassword = await bcrypt.hash("Ftiago@90", 12);
      const id = crypto.randomBytes(12).toString("hex");
      await pool.query(
        'INSERT INTO "User" (id, email, password, name, role, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())',
        [id, "admin@litcoimbra.pt", hashedPassword, "Admin", "SUPER_ADMIN"]
      );
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
      const { rows } = await pool.query(
        'SELECT id FROM "SiteSetting" WHERE key = $1',
        [setting.key]
      );
      if (rows.length === 0) {
        const id = crypto.randomBytes(12).toString("hex");
        await pool.query(
          'INSERT INTO "SiteSetting" (id, key, value) VALUES ($1, $2, $3)',
          [id, setting.key, setting.value]
        );
      }
    }

    console.log("Seed completed: admin user + default settings ready");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Seed error:", e);
  process.exit(1);
});
