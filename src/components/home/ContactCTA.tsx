import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";

type ContactCTAProps = {
  email: string;
  instagram: string;
  facebook: string;
};

export default function ContactCTA({
  email,
  instagram,
  facebook,
}: ContactCTAProps) {
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-jungle-950 via-jungle-900 to-jungle-950 animate-gradient-slow" style={{ backgroundSize: "200% 200%" }} />
      <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/5 via-neon-green/3 to-accent-purple/5 animate-gradient" style={{ backgroundSize: "200% 200%" }} />

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-neon-green/5 rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent-purple/5 rounded-full blur-[60px]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-wide animate-fade-in">
          Junta-te a nos
        </h2>
        <p className="mt-4 text-gray-400 text-lg">
          Segue-nos nas redes sociais e fica a par de tudo.
        </p>

        {/* Social icons */}
        <div className="flex justify-center gap-6 mt-10">
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink social-icon-hover hover:shadow-[0_0_20px_rgba(232,67,147,0.2)]"
              aria-label="Instagram"
            >
              <InstagramIcon size={24} />
            </a>
          )}
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue social-icon-hover hover:shadow-[0_0_20px_rgba(9,132,227,0.2)]"
              aria-label="Facebook"
            >
              <FacebookIcon size={24} />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-orange hover:border-accent-orange social-icon-hover hover:shadow-[0_0_20px_rgba(232,114,28,0.2)]"
              aria-label="Email"
            >
              <Mail size={24} />
            </a>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-8 py-3 border border-jungle-600 hover:bg-jungle-600 text-white font-semibold tracking-wider uppercase text-sm transition-all duration-300 rounded-sm hover:shadow-[0_0_20px_rgba(57,255,20,0.1)]"
          >
            Contacta-nos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
