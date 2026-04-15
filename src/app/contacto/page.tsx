import type { Metadata } from "next";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contacto", {
    title: "Contacto",
    description: "Entra em contacto com o LIT Coimbra.",
  });
}

export default function ContactoPage() {
  return <PageRenderer slug="contacto" />;
}
