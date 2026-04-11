import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Camera, BookOpen, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [eventsCount, galleriesCount, reservationsCount, pendingReservations] =
    await Promise.all([
      prisma.event.count(),
      prisma.gallery.count(),
      prisma.reservation.count(),
      prisma.reservation.count({ where: { status: "PENDING" } }),
    ]);

  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: new Date() }, published: true },
    orderBy: { date: "asc" },
    take: 5,
    select: { id: true, title: true, date: true },
  });

  const recentReservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, date: true, guests: true, status: true, createdAt: true },
  });

  const stats = [
    { label: "Eventos", value: eventsCount, icon: CalendarDays, color: "text-accent-blue" },
    { label: "Galerias", value: galleriesCount, icon: Camera, color: "text-accent-pink" },
    { label: "Reservas", value: reservationsCount, icon: BookOpen, color: "text-accent-orange" },
    { label: "Pendentes", value: pendingReservations, icon: Clock, color: "text-yellow-400" },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-400",
    CONFIRMED: "text-green-400",
    REJECTED: "text-red-400",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className={stat.color} />
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming events */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <h2 className="text-white font-semibold mb-4">Próximos Eventos</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem eventos agendados.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{event.title}</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(event.date).toLocaleDateString("pt-PT")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent reservations */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <h2 className="text-white font-semibold mb-4">Últimas Reservas</h2>
          {recentReservations.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem reservas.</p>
          ) : (
            <ul className="space-y-3">
              {recentReservations.map((res) => (
                <li key={res.id} className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-300 text-sm">{res.name}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {res.guests} pessoas
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${statusColors[res.status] || "text-gray-400"}`}>
                    {res.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
