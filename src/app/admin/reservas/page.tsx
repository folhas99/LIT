"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { SkeletonTable } from "@/components/ui/Skeleton";

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  message: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "text-yellow-400 bg-yellow-400/10" },
  CONFIRMED: { label: "Confirmada", color: "text-green-400 bg-green-400/10" },
  REJECTED: { label: "Rejeitada", color: "text-red-400 bg-red-400/10" },
};

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchReservations = async () => {
    const params = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/reservations${params}`);
    const data = await res.json();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success(`Reserva ${status === "CONFIRMED" ? "confirmada" : status === "REJECTED" ? "rejeitada" : "atualizada"}`);
    fetchReservations();
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Eliminar esta reserva?")) return;
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    toast.success("Reserva eliminada");
    fetchReservations();
  };

  const exportCsv = () => {
    const rows = reservations.map((r) => [
      r.name,
      r.email,
      r.phone,
      new Date(r.date).toISOString(),
      String(r.guests),
      r.message || "",
      r.status,
      new Date(r.createdAt).toISOString(),
    ]);
    const header = ["Nome", "Email", "Telefone", "Data", "Pessoas", "Mensagem", "Estado", "Criada em"];
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""').replace(/[\r\n]+/g, " ")}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-white">Reservas</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2">
            {["all", "PENDING", "CONFIRMED", "REJECTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  filter === f
                    ? "bg-jungle-600 text-white"
                    : "bg-jungle-800 text-gray-400 hover:text-white"
                }`}
              >
                {f === "all" ? "Todas" : statusLabels[f].label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            disabled={reservations.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-jungle-900/50 hover:bg-jungle-800/50 border border-jungle-700/30 rounded-sm transition-colors disabled:opacity-40"
            title="Exportar CSV"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={6} />
      ) : reservations.length === 0 ? (
        <p className="text-gray-500">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-jungle-900/50 border border-jungle-700/30 rounded-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold">{res.name}</h3>
                    <span className={`px-2 py-0.5 rounded-sm text-xs font-medium ${statusLabels[res.status].color}`}>
                      {statusLabels[res.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-400 text-sm">
                    <span>{res.email}</span>
                    <span>{res.phone}</span>
                    <span>{res.guests} pessoas</span>
                    <span>
                      {new Date(res.date).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  {res.message && (
                    <p className="mt-2 text-gray-500 text-sm italic">
                      &quot;{res.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {res.status !== "CONFIRMED" && (
                    <button
                      onClick={() => updateStatus(res.id, "CONFIRMED")}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="Confirmar"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {res.status !== "REJECTED" && (
                    <button
                      onClick={() => updateStatus(res.id, "REJECTED")}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Rejeitar"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {res.status !== "PENDING" && (
                    <button
                      onClick={() => updateStatus(res.id, "PENDING")}
                      className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      title="Pendente"
                    >
                      <Clock size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteReservation(res.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
