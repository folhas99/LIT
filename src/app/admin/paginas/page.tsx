"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileEdit,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Globe,
  EyeIcon,
  LayoutList,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  system: boolean;
  published: boolean;
  showInNav: boolean;
  navLabel: string | null;
  navLabelEn: string | null;
  navOrder: number;
  sectionCount: number;
  createdAt: string;
  updatedAt: string;
};

const SYSTEM_HREF: Record<string, string> = {
  homepage: "/",
  eventos: "/eventos",
  galeria: "/galeria",
  reservas: "/reservas",
  sobre: "/sobre",
  contacto: "/contacto",
};

function publicHref(p: PageRow): string {
  return SYSTEM_HREF[p.slug] || `/p/${p.slug}`;
}

export default function PaginasPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PageRow | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setPages(data);
    } catch {
      setError("Erro ao carregar páginas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const flashSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 2500);
  };

  const handleDelete = async (p: PageRow) => {
    if (p.system) return;
    if (
      !window.confirm(
        `Eliminar a página "${p.title}"? Todas as ${p.sectionCount} secções serão removidas. Esta ação não pode ser anulada.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/pages/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao eliminar");
      }
      flashSuccess("Página eliminada");
      fetchPages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao eliminar");
    }
  };

  const togglePublished = async (p: PageRow) => {
    try {
      const res = await fetch(`/api/pages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      if (!res.ok) throw new Error();
      fetchPages();
    } catch {
      setError("Erro ao alterar estado");
    }
  };

  const toggleNav = async (p: PageRow) => {
    try {
      const res = await fetch(`/api/pages/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInNav: !p.showInNav }),
      });
      if (!res.ok) throw new Error();
      fetchPages();
    } catch {
      setError("Erro ao alterar navegação");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Páginas</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gere as páginas do site. Cada página é composta por secções editáveis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={16} /> {success}
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </span>
          )}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-jungle-600 hover:bg-jungle-500 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <Plus size={18} /> Nova página
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-jungle-900/30 border border-jungle-700/20 rounded-sm">
          <FileEdit size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 mb-2">Nenhuma página criada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <div
              key={p.id}
              className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden"
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="p-2.5 bg-jungle-800/80 rounded-sm border border-jungle-700/30">
                  {p.system ? (
                    <Lock size={16} className="text-jungle-400" />
                  ) : (
                    <FileEdit size={16} className="text-jungle-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{p.title}</span>
                    {p.titleEn && (
                      <span className="text-xs text-gray-500">/ {p.titleEn}</span>
                    )}
                    {p.system && (
                      <span className="text-[10px] uppercase tracking-wider text-jungle-300/80 bg-jungle-800/60 px-2 py-0.5 rounded-sm">
                        Sistema
                      </span>
                    )}
                    {!p.published && (
                      <span className="text-[10px] uppercase tracking-wider text-yellow-400/80 bg-yellow-500/10 px-2 py-0.5 rounded-sm">
                        Rascunho
                      </span>
                    )}
                    {p.showInNav && (
                      <span className="text-[10px] uppercase tracking-wider text-jungle-200 bg-jungle-700/40 px-2 py-0.5 rounded-sm">
                        Menu
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <code className="text-gray-400">{publicHref(p)}</code>
                    <span>·</span>
                    <span>{p.sectionCount} secções</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePublished(p)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                    title={p.published ? "Despublicar" : "Publicar"}
                  >
                    {p.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => toggleNav(p)}
                    className={cn(
                      "p-2 transition-colors",
                      p.showInNav
                        ? "text-jungle-300 hover:text-white"
                        : "text-gray-600 hover:text-white"
                    )}
                    title={p.showInNav ? "Remover do menu" : "Adicionar ao menu"}
                  >
                    <Globe size={16} />
                  </button>
                  <Link
                    href={`/admin/editor/seccoes?page=${p.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-jungle-200 bg-jungle-800/60 hover:bg-jungle-700 border border-jungle-700/40 rounded-sm transition-colors"
                  >
                    <LayoutList size={14} /> Secções
                  </Link>
                  <button
                    onClick={() => setEditing(p)}
                    className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-jungle-800/60 hover:bg-jungle-700 border border-jungle-700/40 rounded-sm transition-colors"
                  >
                    Editar
                  </button>
                  <a
                    href={publicHref(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                    title="Ver página"
                  >
                    <ExternalLink size={14} />
                  </a>
                  {!p.system && (
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePageModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchPages();
            flashSuccess("Página criada");
          }}
        />
      )}

      {editing && (
        <EditPageModal
          page={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            fetchPages();
            flashSuccess("Página atualizada");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Create modal                                                       */
/* ------------------------------------------------------------------ */

function CreatePageModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    titleEn: "",
    description: "",
    showInNav: false,
    navLabel: "",
    navLabelEn: "",
    navOrder: 100,
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleTitleChange = (v: string) => {
    setForm((f) => ({
      ...f,
      title: v,
      slug: f.slug ? f.slug : slugify(v),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao criar");
      }
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao criar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nova página" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {err && (
          <div className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={14} /> {err}
          </div>
        )}
        <Field label="Título *" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Sobre nós"
            className="input"
          />
        </Field>
        <Field label="Título (EN)">
          <input
            type="text"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            placeholder="About us"
            className="input"
          />
        </Field>
        <Field label="Slug (URL) *" required hint="Aparece em /p/<slug>. Apenas letras minúsculas, números e hífens.">
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
            }
            placeholder="sobre-nos"
            className="input"
          />
        </Field>
        <Field label="Descrição (interna)">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input resize-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="accent-jungle-500"
            />
            Publicada
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.showInNav}
              onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
              className="accent-jungle-500"
            />
            Mostrar no menu
          </label>
        </div>
        {form.showInNav && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Etiqueta no menu (PT)">
              <input
                type="text"
                value={form.navLabel}
                onChange={(e) => setForm({ ...form, navLabel: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Etiqueta no menu (EN)">
              <input
                type="text"
                value={form.navLabelEn}
                onChange={(e) => setForm({ ...form, navLabelEn: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Ordem no menu">
              <input
                type="number"
                value={form.navOrder}
                onChange={(e) => setForm({ ...form, navOrder: Number(e.target.value) })}
                className="input"
              />
            </Field>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold text-sm rounded-sm transition-colors"
          >
            <Plus size={14} /> {saving ? "A criar..." : "Criar página"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Edit modal                                                         */
/* ------------------------------------------------------------------ */

function EditPageModal({
  page,
  onClose,
  onSaved,
}: {
  page: PageRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: page.title,
    titleEn: page.titleEn || "",
    description: page.description || "",
    published: page.published,
    showInNav: page.showInNav,
    navLabel: page.navLabel || "",
    navLabelEn: page.navLabelEn || "",
    navOrder: page.navOrder,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao guardar");
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Editar: ${page.title}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {err && (
          <div className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={14} /> {err}
          </div>
        )}
        <div className="text-xs text-gray-500 -mt-2">
          Slug: <code className="text-gray-400">{page.slug}</code> {page.system && "(sistema, não editável)"}
        </div>
        <Field label="Título *" required>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Título (EN)">
          <input
            type="text"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Descrição (interna)">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input resize-none"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="accent-jungle-500"
            />
            Publicada
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.showInNav}
              onChange={(e) => setForm({ ...form, showInNav: e.target.checked })}
              className="accent-jungle-500"
            />
            Mostrar no menu
          </label>
        </div>
        {form.showInNav && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Etiqueta no menu (PT)">
              <input
                type="text"
                value={form.navLabel}
                onChange={(e) => setForm({ ...form, navLabel: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Etiqueta no menu (EN)">
              <input
                type="text"
                value={form.navLabelEn}
                onChange={(e) => setForm({ ...form, navLabelEn: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Ordem no menu">
              <input
                type="number"
                value={form.navOrder}
                onChange={(e) => setForm({ ...form, navOrder: Number(e.target.value) })}
                className="input"
              />
            </Field>
          </div>
        )}
        <div className="flex justify-between gap-2 pt-2">
          <Link
            href={`/admin/editor/seccoes?page=${page.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-jungle-200 bg-jungle-800/60 hover:bg-jungle-700 border border-jungle-700/40 rounded-sm transition-colors"
          >
            <LayoutList size={14} /> Editar secções
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold text-sm rounded-sm transition-colors"
            >
              <Save size={14} /> {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-jungle-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-jungle-900 border border-jungle-700/50 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-jungle-700/40">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <EyeIcon size={18} className="text-jungle-400" /> {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
