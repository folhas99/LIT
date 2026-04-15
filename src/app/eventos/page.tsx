import type { Metadata } from "next";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("eventos", {
    title: "Eventos",
    description: "Próximos eventos e programação do LIT Coimbra.",
  });
}

export default function EventosPage() {
  return <PageRenderer slug="eventos" />;
}
