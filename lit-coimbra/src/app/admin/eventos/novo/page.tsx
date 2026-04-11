import EventForm from "@/components/admin/EventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NovoEventoPage() {
  return (
    <div>
      <Link
        href="/admin/eventos"
        className="inline-flex items-center gap-2 text-jungle-400 hover:text-jungle-300 transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Novo Evento</h1>
      <EventForm />
    </div>
  );
}
