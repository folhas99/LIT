"use client";

import Link from "next/link";
import { Palette, FileText, Image, ArrowRight, LayoutList, Globe, Wand2 } from "lucide-react";

const editorCards = [
  {
    href: "/admin/editor/tema",
    icon: Palette,
    title: "Tema & Cores",
    description:
      "Personaliza as cores, tipografia e efeitos visuais do site.",
  },
  {
    href: "/admin/editor/elementos",
    icon: Wand2,
    title: "Elementos Visuais",
    description:
      "Edita botões, cartões e formulários como tokens globais — estilo Elementor.",
  },
  {
    href: "/admin/paginas",
    icon: FileText,
    title: "Páginas",
    description:
      "Cria e gere páginas do site, como no WordPress. Define metadata, navegação e estado de publicação.",
  },
  {
    href: "/admin/editor/seccoes",
    icon: LayoutList,
    title: "Secções das Páginas",
    description:
      "Compõe cada página com blocos editáveis: texto, galerias, CTAs, eventos, contactos e mais.",
  },
  {
    href: "/admin/editor/media",
    icon: Image,
    title: "Biblioteca de Media",
    description:
      "Gere imagens, vídeos e outros ficheiros multimédia do site.",
  },
  {
    href: "/admin/editor/branding",
    icon: Globe,
    title: "Branding & Ícones",
    description:
      "Personaliza o favicon, logo e identidade visual do site.",
  },
];

export default function EditorHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Editor Visual</h1>
      <p className="text-gray-400 mb-8">
        Ferramentas para personalizar a aparência e conteúdo do site.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editorCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm hover:bg-jungle-800/50 hover:border-jungle-600/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-jungle-800/80 rounded-sm border border-jungle-700/30">
                <card.icon size={24} className="text-jungle-400" />
              </div>
              <ArrowRight
                size={18}
                className="text-gray-600 group-hover:text-jungle-400 transition-colors mt-2"
              />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              {card.title}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
