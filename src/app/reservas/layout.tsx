import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("reservas", {
    title: "Reservas VIP",
    description: "Reserva a tua mesa VIP no LIT Coimbra.",
  });
}

export default function ReservasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
