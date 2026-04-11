import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/ui/SocialIcons";
import { getSettings } from "@/lib/settings";
import ContactForm from "./ContactForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Entra em contacto com o LIT Coimbra.",
};

export default async function ContactoPage() {
  let settings;
  try {
    settings = await getSettings();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    settings = {
      siteName: "LIT Coimbra",
      siteDescription: "A tua nova casa! Discoteca em Coimbra.",
      address: "Coimbra, Portugal",
      phone: "",
      email: "info@litcoimbra.pt",
      instagram: "https://www.instagram.com/lit.coimbra/",
      facebook: "",
      tiktok: "",
      schedule: "Quarta a Sábado, 23:00 - 06:00",
      heroTitle: "LIT Coimbra",
      heroSubtitle: "A tua nova casa",
      heroImage: "",
      heroVideo: "",
      sectionEvents: "true",
      sectionGallery: "true",
      sectionReservations: "true",
      sectionAbout: "true",
      sectionContact: "true",
    };
  }

  return (
    <div className="min-h-screen py-12 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide animate-fade-in">
            Contacto
          </h1>
          <div className="mt-3 w-20 h-0.5 bg-jungle-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Fala connosco
            </h2>
            <p className="text-gray-400 mb-8">
              Tens alguma questão ou sugestão? Entra em contacto através dos seguintes meios.
            </p>

            <div className="space-y-4">
              {settings.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-jungle-400" />
                  <a href={`mailto:${settings.email}`} className="text-gray-300 hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-jungle-400" />
                  <a href={`tel:${settings.phone}`} className="text-gray-300 hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-jungle-400" />
                  <span className="text-gray-300">{settings.address}</span>
                </div>
              )}
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-8">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-pink hover:border-accent-pink transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={20} />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-jungle-700/50 flex items-center justify-center text-gray-400 hover:text-accent-blue hover:border-accent-blue transition-all"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
