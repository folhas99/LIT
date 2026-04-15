import type { Metadata } from "next";
import PageRenderer from "@/components/sections/PageRenderer";
import { buildPageMetadata } from "@/lib/page-meta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("reservas", {
    title: "Reservas",
    description: "Reserva a tua mesa VIP no LIT Coimbra.",
  });
}

export default function ReservasPage() {
  return <PageRenderer slug="reservas" />;
}
