import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

async function resolveTitle(searchParams: URLSearchParams) {
  const slug = searchParams.get("event");
  const page = searchParams.get("page");
  const custom = searchParams.get("title");

  if (custom) {
    return { title: custom, subtitle: searchParams.get("subtitle") || "" };
  }

  if (slug) {
    try {
      const ev = await prisma.event.findUnique({ where: { slug } });
      if (ev) {
        const date = new Intl.DateTimeFormat("pt-PT", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }).format(ev.date);
        return { title: ev.title, subtitle: date };
      }
    } catch {
      // ignore
    }
  }

  if (page) {
    try {
      const meta = await prisma.pageMeta.findUnique({ where: { page } });
      if (meta?.title) {
        return { title: meta.title, subtitle: meta.description?.slice(0, 100) || "" };
      }
    } catch {
      // ignore
    }
  }

  const settings = await getSettings().catch(() => null);
  return {
    title: settings?.siteName || "LIT Coimbra",
    subtitle: settings?.siteDescription || "A tua nova casa",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { title, subtitle } = await resolveTitle(searchParams);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #050a05 0%, #0a1f0f 50%, #1a2a1a 100%)",
          padding: "80px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#39FF14",
          }}
        >
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#39FF14",
            boxShadow: "0 0 20px #39FF14",
          }} />
          LIT COIMBRA
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: "85%" }}>
          <div
            style={{
              fontSize: title.length > 40 ? 64 : 88,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#fff",
              marginBottom: 24,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 32,
                color: "#9ca3af",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 20,
            color: "#6b7280",
          }}
        >
          <span>litcoimbra.pt</span>
          <span style={{ letterSpacing: 4 }}>A TUA NOVA CASA</span>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    }
  );
}
