"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import OpeningHoursBadge from "@/components/ui/OpeningHoursBadge";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import { useI18n } from "@/components/I18nProvider";

type NavItem = {
  label: string;
  href: string;
  enabled: boolean;
};

export default function Header({
  sections,
  scheduleJson,
  logoUrl,
  siteName,
}: {
  sections: {
    events: boolean;
    gallery: boolean;
    reservations: boolean;
    about: boolean;
    contact: boolean;
  };
  scheduleJson?: string;
  logoUrl?: string;
  siteName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: t("nav.events"), href: "/eventos", enabled: sections.events },
    { label: t("nav.gallery"), href: "/galeria", enabled: sections.gallery },
    { label: t("nav.reservations"), href: "/reservas", enabled: sections.reservations },
    { label: t("nav.about"), href: "/sobre", enabled: sections.about },
    { label: t("nav.contact"), href: "/contacto", enabled: sections.contact },
  ].filter((item) => item.enabled);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-jungle-950/90 backdrop-blur-xl border-b border-jungle-700/40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-jungle-950/60 backdrop-blur-md border-b border-jungle-700/20"
      }`}
    >
      <nav aria-label="Navegação principal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label={siteName || "LIT Coimbra"}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName || "LIT Coimbra"}
                width={140}
                height={48}
                priority
                unoptimized
                className="h-10 md:h-12 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
              />
            ) : (
              <>
                <span className="text-2xl font-bold text-white tracking-wider group-hover:text-neon-green/90 transition-colors duration-300">
                  LIT
                </span>
                <span className="text-xs text-jungle-400 tracking-widest uppercase hidden sm:block">
                  Coimbra
                </span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm text-gray-300 hover:text-white transition-colors duration-300 tracking-wide uppercase py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-neon-green/60 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
            {scheduleJson && <OpeningHoursBadge scheduleJson={scheduleJson} compact />}
            <LocaleSwitcher />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isOpen && (
        <div id="mobile-nav" className="md:hidden bg-jungle-900/95 backdrop-blur-xl border-t border-jungle-700/30">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-lg text-gray-300 hover:text-neon-green/80 transition-colors duration-300 tracking-wide uppercase"
              >
                {item.label}
              </Link>
            ))}
            {scheduleJson && (
              <div className="pt-2 border-t border-jungle-700/30">
                <OpeningHoursBadge scheduleJson={scheduleJson} compact />
              </div>
            )}
            <div className="pt-2">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
