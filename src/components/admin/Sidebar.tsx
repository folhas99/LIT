"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  Camera,
  BookOpen,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ScrollText,
  FileEdit,
  ImageIcon,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Eventos", href: "/admin/eventos", icon: CalendarDays },
  { label: "Galeria", href: "/admin/galeria", icon: Camera },
  { label: "Reservas", href: "/admin/reservas", icon: BookOpen },
  { label: "Utilizadores", href: "/admin/utilizadores", icon: Users },
  { label: "Editor Visual", href: "/admin/editor", icon: Palette },
  { label: "Media", href: "/admin/editor/media", icon: ImageIcon },
  { label: "Editor P\u00e1ginas", href: "/admin/editor/paginas", icon: FileEdit },
  { label: "Defini\u00e7\u00f5es", href: "/admin/definicoes", icon: Settings },
  { label: "Logs", href: "/admin/logs", icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (!pathname.startsWith(href)) return false;
    // Avoid highlighting parent routes when a more specific child matches
    const hasMoreSpecificMatch = navItems.some(
      (item) =>
        item.href !== href &&
        item.href.startsWith(href) &&
        pathname.startsWith(item.href)
    );
    return !hasMoreSpecificMatch;
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-jungle-800 rounded-sm text-white"
        aria-label="Menu admin"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-jungle-950/80 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-jungle-900 border-r border-jungle-700/30 z-40 flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-jungle-700/30">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <span className="text-xl font-bold text-white tracking-wider">LIT</span>
            <span className="text-xs text-jungle-400 tracking-widest uppercase">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                isActive(item.href)
                  ? "bg-jungle-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-jungle-800/50"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-jungle-700/30 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ExternalLink size={18} /> Ver Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 text-sm transition-colors w-full"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
