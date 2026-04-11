"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  enabled: boolean;
};

export default function Header({
  sections,
}: {
  sections: {
    events: boolean;
    gallery: boolean;
    reservations: boolean;
    about: boolean;
    contact: boolean;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Eventos", href: "/eventos", enabled: sections.events },
    { label: "Galeria", href: "/galeria", enabled: sections.gallery },
    { label: "Reservas VIP", href: "/reservas", enabled: sections.reservations },
    { label: "Sobre", href: "/sobre", enabled: sections.about },
    { label: "Contacto", href: "/contacto", enabled: sections.contact },
  ].filter((item) => item.enabled);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-jungle-950/80 backdrop-blur-md border-b border-jungle-700/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-wider">
              LIT
            </span>
            <span className="text-xs text-jungle-400 tracking-widest uppercase hidden sm:block">
              Coimbra
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-300 hover:text-white transition-colors duration-200 tracking-wide uppercase"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-jungle-900/95 backdrop-blur-md border-t border-jungle-700/30">
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block text-lg text-gray-300 hover:text-white transition-colors duration-200 tracking-wide uppercase"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
