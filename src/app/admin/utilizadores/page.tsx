"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, ShieldCheck, Eye, EyeOff } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
};

export default function AdminUtilizadoresPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar utilizador");
      }

      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar utilizador");
    }
    setSaving(false);
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Tens a certeza que queres eliminar "${name}"?`)) return;

    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao eliminar utilizador");
      return;
    }
    fetchUsers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Utilizadores</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold rounded-sm transition-colors"
        >
          <Plus size={18} /> Novo Utilizador
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-8 p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <h2 className="text-white font-semibold mb-4">Criar Utilizador</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Nome *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                placeholder="Nome do utilizador"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                placeholder="email@exemplo.pt"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Função</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white text-sm focus:outline-none focus:border-jungle-500 transition-colors"
              >
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white text-sm font-semibold rounded-sm transition-colors"
              >
                {saving ? "A criar..." : "Criar Utilizador"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="px-5 py-2.5 bg-jungle-800 hover:bg-jungle-700 text-gray-300 text-sm rounded-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      {loading ? (
        <p className="text-gray-500">A carregar...</p>
      ) : (
        <div className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jungle-700/30">
                <th className="text-left p-4 text-gray-400 font-medium">Nome</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden sm:table-cell">Email</th>
                <th className="text-left p-4 text-gray-400 font-medium">Função</th>
                <th className="text-right p-4 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-jungle-700/20 hover:bg-jungle-800/30">
                  <td className="p-4 text-white">{user.name}</td>
                  <td className="p-4 text-gray-400 hidden sm:table-cell">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      user.role === "SUPER_ADMIN" ? "text-accent-orange" : "text-jungle-400"
                    }`}>
                      {user.role === "SUPER_ADMIN" ? <ShieldCheck size={14} /> : <Shield size={14} />}
                      {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === "SUPER_ADMIN" ? (
                        <span className="text-gray-600 text-xs italic">Protegido</span>
                      ) : (
                        <button
                          onClick={() => deleteUser(user.id, user.name)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
