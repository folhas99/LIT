import type { Metadata } from "next";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("sobre", {
    title: "Sobre",
    description: "Sobre o LIT Coimbra — a tua nova casa.",
  });
}

export default function SobrePage() {
  return <PageRenderer slug="sobre" />;
}
