"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Server,
  Database,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  Cpu,
  HardDrive,
} from "lucide-react";

type DiagnosticData = {
  server: {
    uptime: number;
    nodeVersion: string;
    platform: string;
    environment: string;
    memory: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  database: {
    connected: boolean;
    latencyMs: number;
    error?: string;
  };
  errors: {
    timestamp: string;
    context: string;
    message: string;
    stack?: string;
  }[];
  errorCount: number;
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export default function AdminLogsPage() {
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [expandedError, setExpandedError] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/debug/logs");
      if (res.status === 403) {
        setError("Acesso negado. Apenas SUPER_ADMIN pode aceder a esta pagina.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch diagnostics");
      const json = await res.json();
      setData(json);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleClear = async () => {
    if (!confirm("Limpar todos os erros registados?")) return;
    setClearing(true);
    try {
      await fetch("/api/debug/logs", { method: "DELETE" });
      await fetchData();
    } catch {
      // ignore
    }
    setClearing(false);
  };

  if (loading) return <p className="text-gray-500">A carregar...</p>;

  if (error && !data) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-700/30 rounded-sm">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Logs & Diagnosticos</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-jungle-700 rounded-full peer-checked:bg-jungle-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
            </div>
            Auto-refresh
          </label>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-jungle-800 hover:bg-jungle-700 text-gray-300 text-sm rounded-sm transition-colors"
          >
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </div>

      {/* Server Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-accent-blue" />
            <span className="text-gray-400 text-sm">Uptime</span>
          </div>
          <p className="text-xl font-bold text-white">
            {formatUptime(data.server.uptime)}
          </p>
        </div>

        <div className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={20} className="text-accent-pink" />
            <span className="text-gray-400 text-sm">Node.js</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data.server.nodeVersion}
          </p>
        </div>

        <div className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive size={20} className="text-accent-orange" />
            <span className="text-gray-400 text-sm">Memoria (Heap)</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data.server.memory.heapUsed} / {data.server.memory.heapTotal} MB
          </p>
        </div>

        <div className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-3 mb-2">
            <Server size={20} className="text-jungle-400" />
            <span className="text-gray-400 text-sm">Ambiente</span>
          </div>
          <p className="text-xl font-bold text-white capitalize">
            {data.server.environment}
          </p>
        </div>
      </div>

      {/* Database Status */}
      <div className="mb-6 p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
        <div className="flex items-center gap-3 mb-3">
          <Database size={20} className="text-white" />
          <h2 className="text-white font-semibold">Base de Dados</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                data.database.connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span
              className={
                data.database.connected ? "text-green-400" : "text-red-400"
              }
            >
              {data.database.connected ? "Conectado" : "Desconectado"}
            </span>
          </div>
          {data.database.connected && (
            <span className="text-gray-500 text-sm">
              Latencia: {data.database.latencyMs}ms
            </span>
          )}
          {data.database.error && (
            <span className="text-red-400 text-sm">{data.database.error}</span>
          )}
        </div>
      </div>

      {/* Memory Details */}
      <div className="mb-6 p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
        <div className="flex items-center gap-3 mb-3">
          <Activity size={20} className="text-white" />
          <h2 className="text-white font-semibold">Detalhes de Memoria</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">RSS</span>
            <p className="text-white font-medium">
              {data.server.memory.rss} MB
            </p>
          </div>
          <div>
            <span className="text-gray-500">Heap Usado</span>
            <p className="text-white font-medium">
              {data.server.memory.heapUsed} MB
            </p>
          </div>
          <div>
            <span className="text-gray-500">Heap Total</span>
            <p className="text-white font-medium">
              {data.server.memory.heapTotal} MB
            </p>
          </div>
          <div>
            <span className="text-gray-500">Externo</span>
            <p className="text-white font-medium">
              {data.server.memory.external} MB
            </p>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      <div className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-white" />
            <h2 className="text-white font-semibold">
              Erros Recentes ({data.errorCount})
            </h2>
          </div>
          {data.errorCount > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm rounded-sm transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
              {clearing ? "A limpar..." : "Limpar Erros"}
            </button>
          )}
        </div>

        {data.errorCount === 0 ? (
          <p className="text-gray-500 text-sm">Sem erros registados.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-jungle-900">
                <tr className="border-b border-jungle-700/30">
                  <th className="text-left p-3 text-gray-400 font-medium">
                    Data
                  </th>
                  <th className="text-left p-3 text-gray-400 font-medium">
                    Contexto
                  </th>
                  <th className="text-left p-3 text-gray-400 font-medium">
                    Mensagem
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.errors.map((err, i) => (
                  <tr
                    key={i}
                    className="border-b border-jungle-700/20 hover:bg-jungle-800/30 cursor-pointer"
                    onClick={() =>
                      setExpandedError(expandedError === i ? null : i)
                    }
                  >
                    <td className="p-3 text-gray-500 whitespace-nowrap">
                      {new Date(err.timestamp).toLocaleString("pt-PT")}
                    </td>
                    <td className="p-3 text-accent-orange whitespace-nowrap">
                      {err.context}
                    </td>
                    <td className="p-3 text-gray-300">
                      <div>{err.message}</div>
                      {expandedError === i && err.stack && (
                        <pre className="mt-2 p-3 bg-jungle-950 rounded-sm text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">
                          {err.stack}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
