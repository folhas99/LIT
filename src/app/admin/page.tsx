import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CalendarDays,
  Camera,
  BookOpen,
  Clock,
  Mail,
  TrendingUp,
  Activity,
  Image as ImageIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

type ActivityLogRow = {
  id: string;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    eventsCount,
    upcomingEventsCount,
    galleriesCount,
    photosCount,
    reservationsCount,
    pendingReservations,
    reservationsLast7,
    messagesCount,
    unreadMessages,
    messagesLast7,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { published: true, date: { gte: now } } }),
    prisma.gallery.count(),
    prisma.photo.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.reservation.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const upcomingEvents = await prisma.event.findMany({
    where: { date: { gte: now }, published: true },
    orderBy: { date: "asc" },
    take: 5,
    select: { id: true, title: true, date: true, eventType: true },
  });

  const recentReservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, date: true, guests: true, status: true, createdAt: true },
  });

  // Reservations per day in last 30 days
  const reservationsOverTime = await prisma.reservation.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const reservationsByDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    reservationsByDay.set(key, 0);
  }
  for (const r of reservationsOverTime) {
    const key = r.createdAt.toISOString().slice(0, 10);
    reservationsByDay.set(key, (reservationsByDay.get(key) || 0) + 1);
  }
  const chartData = Array.from(reservationsByDay.entries());
  const maxVal = Math.max(1, ...chartData.map(([, v]) => v));

  let activityLogs: ActivityLogRow[] = [];
  try {
    activityLogs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        userName: true,
        action: true,
        entity: true,
        entityId: true,
        createdAt: true,
      },
    });
  } catch {
    // ActivityLog table might not exist yet
  }

  const stats = [
    {
      label: "Próximos eventos",
      value: upcomingEventsCount,
      sub: `${eventsCount} no total`,
      icon: CalendarDays,
      color: "text-accent-blue",
      href: "/admin/eventos",
    },
    {
      label: "Reservas pendentes",
      value: pendingReservations,
      sub: `+${reservationsLast7} em 7 dias`,
      icon: Clock,
      color: "text-yellow-400",
      href: "/admin/reservas",
    },
    {
      label: "Mensagens não lidas",
      value: unreadMessages,
      sub: `+${messagesLast7} em 7 dias`,
      icon: Mail,
      color: "text-accent-pink",
      href: "/admin/mensagens",
    },
    {
      label: "Álbuns",
      value: galleriesCount,
      sub: `${photosCount} fotos`,
      icon: ImageIcon,
      color: "text-accent-orange",
      href: "/admin/galeria",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "text-yellow-400",
    CONFIRMED: "text-green-400",
    REJECTED: "text-red-400",
  };

  const actionLabel: Record<string, string> = {
    create: "criou",
    update: "atualizou",
    delete: "eliminou",
    publish: "publicou",
    unpublish: "despublicou",
    login: "entrou",
    duplicate: "duplicou",
  };
  const entityLabel: Record<string, string> = {
    event: "evento",
    gallery: "galeria",
    photo: "foto",
    reservation: "reserva",
    message: "mensagem",
    section: "secção",
    settings: "definições",
    user: "utilizador",
  };

  const timeAgo = (d: Date) => {
    const diff = Math.floor((now.getTime() - new Date(d).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm">Olá, {session.user?.name || "admin"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 bg-jungle-900/50 border border-jungle-700/30 rounded-sm hover:bg-jungle-800/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={18} className={stat.color} />
              <span className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Reservations chart */}
      <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-neon-green" />
          <h2 className="text-white font-semibold">Reservas nos últimos 30 dias</h2>
        </div>
        <div className="flex items-end gap-0.5 h-24">
          {chartData.map(([day, count]) => {
            const pct = (count / maxVal) * 100;
            return (
              <div
                key={day}
                className="flex-1 bg-jungle-700/40 rounded-t-sm hover:bg-jungle-500 transition-colors relative group"
                style={{ height: `${Math.max(4, pct)}%` }}
                title={`${day}: ${count} reserva${count === 1 ? "" : "s"}`}
              >
                {count > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>{chartData[0]?.[0]}</span>
          <span>hoje</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming events */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays size={18} className="text-accent-blue" />
            <h2 className="text-white font-semibold">Próximos Eventos</h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem eventos agendados.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="flex justify-between items-center gap-2">
                  <Link
                    href={`/admin/eventos/${event.id}`}
                    className="text-gray-300 text-sm hover:text-white truncate"
                  >
                    {event.title}
                  </Link>
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString("pt-PT")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent reservations */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-accent-orange" />
            <h2 className="text-white font-semibold">Últimas Reservas</h2>
          </div>
          {recentReservations.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem reservas.</p>
          ) : (
            <ul className="space-y-3">
              {recentReservations.map((res) => (
                <li key={res.id} className="flex justify-between items-center gap-2">
                  <div className="flex-1 truncate">
                    <span className="text-gray-300 text-sm">{res.name}</span>
                    <span className="text-gray-500 text-xs ml-2">{res.guests}p</span>
                  </div>
                  <span className={`text-xs font-medium ${statusColors[res.status] || "text-gray-400"}`}>
                    {res.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity log */}
        <div className="p-6 bg-jungle-900/50 border border-jungle-700/30 rounded-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-neon-green" />
            <h2 className="text-white font-semibold">Atividade recente</h2>
          </div>
          {activityLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">Sem atividade registada.</p>
          ) : (
            <ul className="space-y-2.5">
              {activityLogs.map((log) => (
                <li key={log.id} className="text-xs flex items-center gap-2">
                  <span className="text-gray-400 w-8 tabular-nums">{timeAgo(log.createdAt)}</span>
                  <span className="text-gray-300 flex-1 truncate">
                    <span className="text-white">{log.userName || "?"}</span>{" "}
                    {actionLabel[log.action] || log.action}{" "}
                    <span className="text-jungle-400">{entityLabel[log.entity] || log.entity}</span>
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
