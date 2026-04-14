import Link from "next/link";
import { Mail, MapPin, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import OpeningHoursBadge from "@/components/ui/OpeningHoursBadge";

type FooterProps = {
  settings: {
    siteName: string;
    address: string;
    email: string;
    phone: string;
    instagram: string;
    facebook: string;
    schedule: string;
    scheduleHours?: string;
  };
  sections: {
    events: boolean;
    gallery: boolean;
    reservations: boolean;
    about: boolean;
    contact: boolean;
  };
};

export default function Footer({ settings, sections }: FooterProps) {
  return (
    <footer className="bg-jungle-900 gradient-border-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white tracking-wider mb-4">
              LIT <span className="text-jungle-400 text-sm">Coimbra</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A tua nova casa.
            </p>
            <div className="flex gap-4 mt-6">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink social-icon-hover hover:shadow-[0_0_15px_rgba(232,67,147,0.15)]"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue social-icon-hover hover:shadow-[0_0_15px_rgba(9,132,227,0.15)]"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={18} />
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="w-10 h-10 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-orange hover:border-accent-orange social-icon-hover hover:shadow-[0_0_15px_rgba(232,114,28,0.15)]"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                  Home
                </Link>
              </li>
              {sections.events && (
                <li>
                  <Link href="/eventos" className="text-gray-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                    Eventos
                  </Link>
                </li>
              )}
              {sections.gallery && (
                <li>
                  <Link href="/galeria" className="text-gray-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                    Galeria
                  </Link>
                </li>
              )}
              {sections.reservations && (
                <li>
                  <Link href="/reservas" className="text-gray-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                    Reservas VIP
                  </Link>
                </li>
              )}
              {sections.about && (
                <li>
                  <Link href="/sobre" className="text-gray-400 hover:text-neon-green/70 text-sm transition-colors duration-300">
                    Sobre
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">
              Informação
            </h4>
            <ul className="space-y-3">
              {settings.address && (
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-jungle-500" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.schedule && (
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <Clock size={16} className="mt-0.5 shrink-0 text-jungle-500" />
                  <span>{settings.schedule}</span>
                </li>
              )}
              {settings.scheduleHours && (
                <li className="pt-1">
                  <OpeningHoursBadge scheduleJson={settings.scheduleHours} />
                </li>
              )}
              {settings.email && (
                <li className="flex items-start gap-2 text-gray-400 text-sm">
                  <Mail size={16} className="mt-0.5 shrink-0 text-jungle-500" />
                  <a href={`mailto:${settings.email}`} className="hover:text-neon-green/70 transition-colors duration-300">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-jungle-700/20 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} {settings.siteName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
