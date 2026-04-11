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
        <div className="absolute inset-0 hero-animated-bg" />
      )}

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-jungle-950/80 via-jungle-950/40 to-jungle-950/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 via-transparent to-neon-green/5 animate-gradient-slow" style={{ backgroundSize: "200% 200%" }} />

      {/* Floating particles */}
      <div className="particles-container">
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      {/* Decorative glow orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-jungle-600/10 rounded-full blur-3xl animate-[soft-pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/3 right-10 w-56 h-56 bg-accent-purple/8 rounded-full blur-3xl animate-[soft-pulse_8s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green/3 rounded-full blur-[100px] animate-[soft-pulse_10s_ease-in-out_infinite_2s]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wider animate-fade-in-up neon-text">
          {title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 tracking-widest uppercase animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          {showReservations && (
            <Link
              href="/reservas"
              className="px-8 py-3 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm animate-pulse-glow"
            >
              Reservar Mesa
            </Link>
          )}
          <Link
            href="/eventos"
            className="px-8 py-3 border border-white/20 hover:border-neon-green/40 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm hover:shadow-[0_0_15px_rgba(57,255,20,0.1)]"
          >
            Ver Eventos
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] text-white/30 uppercase tracking-widest">Scroll</span>
        <div className="animate-scroll-bounce text-white/40">
          <ChevronDown size={24} />
        </div>
      </div>
    </section>
  );
}
