"use client";

import Link from "next/link";
import { Palette, FileText, Image, ArrowRight } from "lucide-react";

const editorCards = [
  {
    href: "/admin/editor/tema",
    icon: Palette,
    title: "Tema & Cores",
    description:
      "Personaliza as cores, tipografia e efeitos visuais do site.",
  },
  {
    href: "/admin/editor/paginas",
    icon: FileText,
    title: "Conteudo das Paginas",
    description:
      "Edita o conteudo de texto e imagens de cada pagina do site.",
  },
  {
    href: "/admin/editor/media",
    icon: Image,
    title: "Biblioteca de Media",
    description:
      "Gere imagens, videos e outros ficheiros multimidia do site.",
  },
];

export default function EditorHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Editor Visual</h1>
      <p className="text-gray-400 mb-8">
        Ferramentas para personalizar a aparencia e conteudo do site.
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
