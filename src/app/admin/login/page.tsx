"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jungle-950">
        <div className="text-jungle-400 text-sm">A carregar...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou password incorretos.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-jungle-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wider">LIT</h1>
          <p className="text-jungle-400 text-sm mt-1">Administração</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 transition-colors"
              placeholder="admin@litcoimbra.pt"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-jungle-900 border border-jungle-700/50 rounded-sm text-white placeholder-gray-500 focus:outline-none focus:border-jungle-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-jungle-600 hover:bg-jungle-500 disabled:opacity-50 text-white font-semibold tracking-wider uppercase text-sm transition-colors rounded-sm"
          >
            <LogIn size={18} />
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
