import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Statistiques du dashboard établissement.
 *
 * 🔒 Utilise le client admin (service_role) avec filtrage manuel par establishment_id.
 *    L'establishment_id provient du profil authentifié (getCurrentProfile()),
 *    il est donc impossible pour un client de le falsifier.
 *
 *    Note : Idéalement, on utiliserait le client standard qui applique RLS
 *    automatiquement. Mais si la migration 003 (RLS policies) n'est pas encore
 *    exécutée, le client standard ne peut rien lire. Le client admin garantit
 *    le fonctionnement dans tous les cas, avec filtrage applicatif strict.
 *
 *    Sécurité : le filtrage par establishment_id est fait côté serveur, jamais
 *    l'utilisateur ne peut passer un autre establishment_id.
 */

export type HotelStats = {
  rooms: {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    cleaning: number;
    maintenance: number;
    inactive: number;
  };
  today: {
    arrivals: number;
    departures: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    partialPayments: number;
    unpaid: number;
  };
  occupancy: {
    rate: number;
  };
  subscription: {
    plan_name: string | null;
    status: string;
    start: string | null;
    end: string | null;
    daysUntilExpiry: number | null;
  };
  alerts: {
    housekeepingPending: number;
    maintenanceOpen: number;
    subscriptionExpiringSoon: boolean;
  };
};

export type MonthlyRevenue = { month: string; revenue: number };
export type OccupancyTrend = { date: string; rate: number };

export async function getHotelStats(
  establishmentId: string
): Promise<HotelStats | null> {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  // --- ROOMS ---
  const { data: rooms } = await supabase
    .from("rooms")
    .select("status")
    .eq("establishment_id", establishmentId);
  const roomsList = rooms ?? [];
  const roomsStats = {
    total: roomsList.length,
    available: roomsList.filter((r) => r.status === "available").length,
    reserved: roomsList.filter((r) => r.status === "reserved").length,
    occupied: roomsList.filter((r) => r.status === "occupied").length,
    cleaning: roomsList.filter((r) => r.status === "cleaning").length,
    maintenance: roomsList.filter((r) => r.status === "maintenance").length,
    inactive: roomsList.filter((r) => r.status === "inactive").length,
  };

  // --- ARRIVALS / DEPARTURES ---
  const { data: arrivals } = await supabase
    .from("reservations")
    .select("id")
    .eq("establishment_id", establishmentId)
    .eq("check_in_date", today)
    .in("status", ["confirmed", "checked_in"]);

  const { data: departures } = await supabase
    .from("reservations")
    .select("id")
    .eq("establishment_id", establishmentId)
    .eq("check_out_date", today)
    .in("status", ["checked_in", "checked_out"]);

  // --- REVENUE ---
  const { data: todayPayments } = await supabase
    .from("stay_payments")
    .select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", today + "T00:00:00.000Z")
    .lte("payment_date", today + "T23:59:59.999Z");
  const todayRevenue = (todayPayments ?? []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const { data: monthPayments } = await supabase
    .from("stay_payments")
    .select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", startOfMonth);
  const monthRevenue = (monthPayments ?? []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  // --- PARTIAL / UNPAID ---
  const { data: reservations } = await supabase
    .from("reservations")
    .select("balance_amount, paid_amount")
    .eq("establishment_id", establishmentId)
    .in("status", ["confirmed", "checked_in", "checked_out"]);
  const reservationsList = reservations ?? [];
  const partialPayments = reservationsList.filter(
    (r) => r.balance_amount > 0
  ).length;
  const unpaid = reservationsList.filter(
    (r) => r.balance_amount > 0 && r.paid_amount === 0
  ).length;

  // --- OCCUPANCY ---
  const activeRooms =
    roomsStats.total - roomsStats.inactive - roomsStats.maintenance;
  const occupancyRate =
    activeRooms > 0
      ? Math.round((roomsStats.occupied / activeRooms) * 100)
      : 0;

  // --- SUBSCRIPTION ---
  const { data: establishment } = await supabase
    .from("establishments")
    .select(
      `subscription_status, subscription_start, subscription_end, plan:plans(name)`
    )
    .eq("id", establishmentId)
    .single();

  let daysUntilExpiry: number | null = null;
  if (establishment?.subscription_end) {
    const end = new Date(establishment.subscription_end);
    daysUntilExpiry = Math.ceil(
      (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // --- ALERTS ---
  const { count: housekeepingCount } = await supabase
    .from("housekeeping_tasks")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .in("status", ["dirty", "in_progress"]);

  const { count: maintenanceCount } = await supabase
    .from("maintenance_tickets")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .in("status", ["open", "in_progress"]);

  return {
    rooms: roomsStats,
    today: {
      arrivals: arrivals?.length ?? 0,
      departures: departures?.length ?? 0,
    },
    revenue: {
      today: todayRevenue,
      thisMonth: monthRevenue,
      partialPayments,
      unpaid,
    },
    occupancy: { rate: occupancyRate },
    subscription: {
      plan_name: (establishment as any)?.plan?.name ?? null,
      status: establishment?.subscription_status ?? "active",
      start: establishment?.subscription_start ?? null,
      end: establishment?.subscription_end ?? null,
      daysUntilExpiry,
    },
    alerts: {
      housekeepingPending: housekeepingCount ?? 0,
      maintenanceOpen: maintenanceCount ?? 0,
      subscriptionExpiringSoon:
        daysUntilExpiry !== null && daysUntilExpiry <= 30,
    },
  };
}

export async function getMonthlyRevenue(
  establishmentId: string
): Promise<MonthlyRevenue[]> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const months: MonthlyRevenue[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    const { data } = await supabase
      .from("stay_payments")
      .select("amount")
      .eq("establishment_id", establishmentId)
      .gte("payment_date", monthStart)
      .lt("payment_date", monthEnd);

    const revenue = (data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0);
    months.push({
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      revenue,
    });
  }

  return months;
}

export async function getOccupancyTrend(
  establishmentId: string
): Promise<OccupancyTrend[]> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const days: OccupancyTrend[] = [];

  const { data: rooms } = await supabase
    .from("rooms")
    .select("status")
    .eq("establishment_id", establishmentId);
  const activeRooms = (rooms ?? []).filter(
    (r) => r.status !== "inactive" && r.status !== "maintenance"
  ).length;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    let rate = 0;
    if (activeRooms > 0) {
      const { count } = await supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("establishment_id", establishmentId)
        .in("status", ["checked_in", "checked_out"])
        .lte("check_in_date", dateStr)
        .gte("check_out_date", dateStr);
      rate = Math.min(100, Math.round(((count ?? 0) / activeRooms) * 100));
    }

    days.push({
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      rate,
    });
  }

  return days;
}
