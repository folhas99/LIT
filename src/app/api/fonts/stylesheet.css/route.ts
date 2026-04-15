import { prisma } from "@/lib/prisma";

/**
 * Serves a generated stylesheet of @font-face rules for every uploaded font.
 * Linked once from the root layout so custom families are available everywhere
 * (public site + admin) without a JS hop.
 *
 * Cached at the edge for a short window; on-demand revalidation flushes it
 * whenever a font is uploaded / renamed / deleted.
 */
export async function GET() {
  let css = "/* No custom fonts uploaded. */\n";
  try {
    const fonts = await prisma.font.findMany({ orderBy: { createdAt: "asc" } });
    if (fonts.length > 0) {
      css = fonts
        .map((f) => {
          const formatHint =
            f.format === "woff2" ? "woff2"
            : f.format === "woff" ? "woff"
            : f.format === "ttf" ? "truetype"
            : f.format === "otf" ? "opentype"
            : f.format;
          // Family name is wrapped in quotes to allow spaces.
          const family = f.family.replace(/"/g, '\\"');
          const display = f.display || "swap";
          return [
            `@font-face {`,
            `  font-family: "${family}";`,
            `  font-style: ${f.style || "normal"};`,
            `  font-weight: ${f.weight || 400};`,
            `  font-display: ${display};`,
            `  src: url("${f.url}") format("${formatHint}");`,
            `}`,
          ].join("\n");
        })
        .join("\n\n");
    }
  } catch (err) {
    console.error("Failed to build font stylesheet:", err);
    // Fall through with the empty stylesheet so the page still renders.
  }

  return new Response(css, {
    status: 200,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      // Short cache so the rare admin upload propagates quickly.
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
