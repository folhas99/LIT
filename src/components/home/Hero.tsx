import Link from "next/link";
import { ChevronDown } from "lucide-react";

type HeroProps = {
  title: string;
  subtitle: string;
  heroImage?: string;
  heroVideo?: string;
  showReservations: boolean;
};

export default function Hero({
  title,
  subtitle,
  heroVideo,
  showReservations,
}: HeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden -mt-16 md:-mt-20">
      {/* Background */}
      {heroVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-jungle-950 via-jungle-900 to-jungle-800" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-jungle-950/70" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-jungle-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-10 w-48 h-48 bg-accent-pink/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wider animate-fade-in-up">
          {title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 tracking-widest uppercase animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {showReservations && (
            <Link
              href="/reservas"
              className="px-8 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
            >
              Reservar Mesa
            </Link>
          )}
          <Link
            href="/eventos"
            className="px-8 py-3 border border-white/20 hover:border-white/50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            Ver Eventos
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50">
        <ChevronDown size={28} />
      </div>
    </section>
  );
}
