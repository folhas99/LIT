import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Compass size={48} className="mx-auto text-jungle-400 mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-400 text-sm mb-6">
          A página que procuras não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold tracking-wider uppercase rounded-sm transition-colors"
        >
          Voltar à homepage
        </Link>
      </div>
    </div>
  );
}
