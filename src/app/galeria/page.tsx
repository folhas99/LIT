import type { Metadata } from "next";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("galeria", {
    title: "Galeria",
    description: "Fotos das melhores noites no LIT Coimbra.",
  });
}

export default function GaleriaPage() {
  return <PageRenderer slug="galeria" />;
}
