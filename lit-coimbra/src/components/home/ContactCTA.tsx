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
    <section className="py-20 md:py-28 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-wide animate-fade-in">
          Junta-te a nós
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
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink transition-all duration-300"
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
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue transition-all duration-300"
              aria-label="Facebook"
            >
              <FacebookIcon size={24} />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="w-14 h-14 rounded-full border border-jungle-600/50 flex items-center justify-center text-gray-400 hover:text-accent-orange hover:border-accent-orange transition-all duration-300"
              aria-label="Email"
            >
              <Mail size={24} />
            </a>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-8 py-3 border border-jungle-600 hover:bg-jungle-600 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            Contacta-nos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
