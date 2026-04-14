import Link from "next/link";
import { Calendar } from "lucide-react";
import Countdown from "@/components/ui/Countdown";

export default function NextEventCountdown({
  title,
  slug,
  date,
}: {
  title: string;
  slug: string;
  date: Date;
}) {
  const formatted = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return (
    <section className="relative bg-jungle-950 border-y border-jungle-700/30 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 text-neon-green text-xs uppercase tracking-widest mb-3">
          <Calendar size={14} />
          Próximo evento
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
          <Link href={`/eventos/${slug}`} className="hover:text-neon-green/90 transition-colors">
            {title}
          </Link>
        </h2>
        <p className="text-gray-400 text-sm mb-6 capitalize">{formatted}</p>
        <Countdown targetDate={date.toISOString()} />
      </div>
    </section>
  );
}
