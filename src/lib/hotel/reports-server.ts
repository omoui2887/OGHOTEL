import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Rapports et statistiques — SERVEUR UNIQUEMENT.
 * 🔒 Filtrage par establishment_id.
 */

export type ReportPeriod = {
  start: string;
  end: string;
  label: string;
};

export type ReportsData = {
  occupancy: { rate: number; occupiedNights: number; totalNights: number };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    byDay: { date: string; revenue: number }[];
    byMonth: { month: string; revenue: number }[];
  };
  revenueByRoomType: { room_type: string; revenue: number; nights: number }[];
  reservationsByStatus: { status: string; count: number; label: string }[];
  payments: {
    totalReceived: number;
    count: number;
    byMethod: { method: string; total: number; count: number; label?: string }[];
  };
  unpaid: {
    partialPayments: number;
    unpaid: number;
    totalBalance: number;
    details: { guest_name: string; room_number: string; balance: number; total: number }[];
  };
  expensesByCategory: { category: string; total: number; count: number; label?: string }[];
  netResult: { revenue: number; expenses: number; net: number };
  topRooms: { room_number: string; nights: number; revenue: number }[];
  topGuests: { guest_name: string; stays: number; totalPaid: number }[];
};

export function getPeriodRange(period: string): ReportPeriod {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth(), 1);
      break;
    case "quarter":
      start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case "year":
      start.setMonth(0, 1);
      break;
    default:
      start.setMonth(now.getMonth(), 1);
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
    label: period,
  };
}

export async function getReports(
  establishmentId: string,
  period: string = "month"
): Promise<ReportsData | null> {
  const supabase = createSupabaseAdminClient();
  const { start, end } = getPeriodRange(period);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // 1. OCCUPANCY — taux d'occupation sur la période
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("establishment_id", establishmentId)
    .neq("status", "inactive");

  const totalRooms = rooms?.length ?? 0;
  const periodDays = Math.max(1, Math.ceil((now.getTime() - new Date(start).getTime()) / 86400000));
  const totalNights = totalRooms * periodDays;

  const { count: occupiedNights } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .in("status", ["checked_in", "checked_out"])
    .lte("check_in_date", end)
    .gte("check_out_date", start);

  const occupancyRate = totalNights > 0 ? Math.round(((occupiedNights ?? 0) / totalNights) * 100) : 0;

  // 2. REVENUE — chiffre d'affaires
  const { data: todayPay } = await supabase
    .from("stay_payments").select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", today + "T00:00:00.000Z");
  const revenueToday = (todayPay ?? []).reduce((s, p: any) => s + p.amount, 0);

  const { data: weekPay } = await supabase
    .from("stay_payments").select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", startOfWeek.toISOString());
  const revenueWeek = (weekPay ?? []).reduce((s, p: any) => s + p.amount, 0);

  const { data: monthPay } = await supabase
    .from("stay_payments").select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", startOfMonth.toISOString());
  const revenueMonth = (monthPay ?? []).reduce((s, p: any) => s + p.amount, 0);

  const { data: yearPay } = await supabase
    .from("stay_payments").select("amount")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", startOfYear.toISOString());
  const revenueYear = (yearPay ?? []).reduce((s, p: any) => s + p.amount, 0);

  // Revenue by day (last 14 days)
  const byDay: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const dayRev = (monthPay ?? [])
      .filter((p: any) => p.payment_date?.startsWith(dayStr))
      .reduce((s: number, p: any) => s + p.amount, 0);
    byDay.push({ date: dayStr.slice(5), revenue: dayRev });
  }

  // Revenue by month (last 6 months)
  const byMonth: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const { data: mPay } = await supabase
      .from("stay_payments").select("amount")
      .eq("establishment_id", establishmentId)
      .gte("payment_date", mStart).lt("payment_date", mEnd);
    const rev = (mPay ?? []).reduce((s, p: any) => s + p.amount, 0);
    byMonth.push({ month: d.toLocaleDateString("fr-FR", { month: "short" }), revenue: rev });
  }

  // 3. REVENUE BY ROOM TYPE
  const { data: ressWithRoom } = await supabase
    .from("reservations").select(`
      total_amount, nights,
      room:rooms(room_type:room_types(name))
    `)
    .eq("establishment_id", establishmentId)
    .in("status", ["checked_in", "checked_out"])
    .gte("check_in_date", start);

  const roomTypeMap = new Map<string, { revenue: number; nights: number }>();
  (ressWithRoom ?? []).forEach((r: any) => {
    const rtName = r.room?.room_type?.name ?? "Autre";
    if (!roomTypeMap.has(rtName)) roomTypeMap.set(rtName, { revenue: 0, nights: 0 });
    const entry = roomTypeMap.get(rtName)!;
    entry.revenue += r.total_amount || 0;
    entry.nights += r.nights || 0;
  });
  const revenueByRoomType = Array.from(roomTypeMap.entries())
    .map(([room_type, data]) => ({ room_type, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // 4. RESERVATIONS BY STATUS
  const { data: allRes } = await supabase
    .from("reservations").select("status")
    .eq("establishment_id", establishmentId)
    .gte("check_in_date", start);

  const statusMap = new Map<string, number>();
  (allRes ?? []).forEach((r: any) => {
    statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
  });
  const statusLabels: Record<string, string> = {
    pending: "En attente", confirmed: "Confirmée", checked_in: "Arrivé",
    checked_out: "Terminé", cancelled: "Annulée", no_show: "No-show",
  };
  const reservationsByStatus = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count, label: statusLabels[status] ?? status }))
    .sort((a, b) => b.count - a.count);

  // 5. PAYMENTS SUMMARY
  const { data: periodPay } = await supabase
    .from("stay_payments").select("amount, method")
    .eq("establishment_id", establishmentId)
    .gte("payment_date", start + "T00:00:00.000Z");

  const totalReceived = (periodPay ?? []).reduce((s, p: any) => s + p.amount, 0);
  const methodMap = new Map<string, { total: number; count: number }>();
  (periodPay ?? []).forEach((p: any) => {
    const m = p.method || "autre";
    if (!methodMap.has(m)) methodMap.set(m, { total: 0, count: 0 });
    const e = methodMap.get(m)!;
    e.total += p.amount; e.count += 1;
  });
  const methodLabels: Record<string, string> = {
    cash: "Espèces", orange: "Orange Money", mtn: "MTN Money",
    moov: "Moov Money", wave: "Wave", card: "Carte", transfer: "Virement",
  };
  const paymentsByMethod = Array.from(methodMap.entries())
    .map(([method, data]) => ({ method, ...data, label: methodLabels[method] ?? method }))
    .sort((a, b) => b.total - a.total);

  // 6. UNPAID — paiements partiels et impayés
  const { data: activeRes } = await supabase
    .from("reservations").select(`
      id, total_amount, paid_amount, balance_amount, status,
      guest:guests(full_name), room:rooms(room_number)
    `)
    .eq("establishment_id", establishmentId)
    .in("status", ["confirmed", "checked_in", "checked_out"])
    .gt("balance_amount", 0);

  const unpaidDetails = (activeRes ?? []).map((r: any) => ({
    guest_name: r.guest?.full_name ?? "—",
    room_number: r.room?.room_number ?? "—",
    balance: r.balance_amount,
    total: r.total_amount,
  })).sort((a, b) => b.balance - a.balance);

  const totalBalance = unpaidDetails.reduce((s, d) => s + d.balance, 0);

  // 7. EXPENSES BY CATEGORY
  const { data: expenses } = await supabase
    .from("expenses").select("amount, category")
    .eq("establishment_id", establishmentId)
    .gte("expense_date", start);

  const catLabels: Record<string, string> = {
    salaire: "Salaires", electricite: "Électricité", eau: "Eau", internet: "Internet",
    maintenance: "Maintenance", fournitures: "Fournitures", carburant: "Carburant",
    nettoyage: "Nettoyage", autre: "Autre",
  };
  const catMap = new Map<string, { total: number; count: number }>();
  (expenses ?? []).forEach((e: any) => {
    if (!catMap.has(e.category)) catMap.set(e.category, { total: 0, count: 0 });
    const entry = catMap.get(e.category)!;
    entry.total += e.amount; entry.count += 1;
  });
  const expensesByCategory = Array.from(catMap.entries())
    .map(([category, data]) => ({ category, ...data, label: catLabels[category] ?? category }))
    .sort((a, b) => b.total - a.total);

  const totalExpenses = (expenses ?? []).reduce((s, e: any) => s + e.amount, 0);

  // 8. NET RESULT
  const netResult = {
    revenue: totalReceived,
    expenses: totalExpenses,
    net: totalReceived - totalExpenses,
  };

  // 9. TOP ROOMS
  const roomUsageMap = new Map<string, { nights: number; revenue: number }>();
  (ressWithRoom ?? []).forEach((r: any) => {
    const rn = r.room?.room_number ?? "—";
    if (!roomUsageMap.has(rn)) roomUsageMap.set(rn, { nights: 0, revenue: 0 });
    const e = roomUsageMap.get(rn)!;
    e.nights += r.nights || 0; e.revenue += r.total_amount || 0;
  });
  const topRooms = Array.from(roomUsageMap.entries())
    .map(([room_number, data]) => ({ room_number, ...data }))
    .sort((a, b) => b.nights - a.nights)
    .slice(0, 5);

  // 10. TOP GUESTS
  const { data: guestRes } = await supabase
    .from("reservations").select(`
      id, guest_id, total_amount, paid_amount,
      guest:guests(full_name)
    `)
    .eq("establishment_id", establishmentId)
    .in("status", ["checked_in", "checked_out"])
    .gte("check_in_date", start);

  const guestMap = new Map<string, { guest_name: string; stays: number; totalPaid: number }>();
  (guestRes ?? []).forEach((r: any) => {
    const gid = r.guest_id;
    const gname = r.guest?.full_name ?? "—";
    if (!guestMap.has(gid)) guestMap.set(gid, { guest_name: gname, stays: 0, totalPaid: 0 });
    const e = guestMap.get(gid)!;
    e.stays += 1; e.totalPaid += r.paid_amount || 0;
  });
  const topGuests = Array.from(guestMap.values())
    .sort((a, b) => b.stays - a.stays)
    .slice(0, 5);

  return {
    occupancy: { rate: occupancyRate, occupiedNights: occupiedNights ?? 0, totalNights },
    revenue: {
      today: revenueToday, thisWeek: revenueWeek,
      thisMonth: revenueMonth, thisYear: revenueYear,
      byDay, byMonth,
    },
    revenueByRoomType,
    reservationsByStatus,
    payments: { totalReceived, count: periodPay?.length ?? 0, byMethod: paymentsByMethod },
    unpaid: {
      partialPayments: unpaidDetails.filter(d => d.total > d.balance).length,
      unpaid: unpaidDetails.filter(d => d.balance === d.total).length,
      totalBalance, details: unpaidDetails,
    },
    expensesByCategory,
    netResult,
    topRooms,
    topGuests,
  };
}
