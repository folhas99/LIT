import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${baseUrl}/eventos`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/galeria`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/reservas`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  try {
    const events = await prisma.event.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });

    const galleries = await prisma.gallery.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    });

    const eventPages = events.map((e) => ({
      url: `${baseUrl}/eventos/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const galleryPages = galleries.map((g) => ({
      url: `${baseUrl}/galeria/${g.slug}`,
      lastModified: g.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...eventPages, ...galleryPages];
  } catch {
    return staticPages;
  }
}
