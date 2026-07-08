import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Room, RoomStatus } from "@/lib/hotel/rooms";

/**
 * Données pour le calendrier de disponibilité.
 *
 * 🔒 Filtrage par establishment_id.
 */

export type CalendarRoom = {
  id: string;
  room_number: string;
  floor: string | null;
  room_type_name: string | null;
  status: RoomStatus;
};

export type CalendarReservation = {
  id: string;
  room_id: string;
  guest_name: string | null;
  guest_phone: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
  source: string;
};

export type CalendarData = {
  rooms: CalendarRoom[];
  reservations: CalendarReservation[];
};

/**
 * Récupère les chambres et réservations pour une plage de dates.
 *
 * @param establishmentId L'établissement connecté
 * @param startDate Date de début (YYYY-MM-DD)
 * @param endDate Date de fin (YYYY-MM-DD)
 * @param roomTypeId Filtre optionnel par type de chambre
 */
export async function getCalendarData(
  establishmentId: string,
  startDate: string,
  endDate: string,
  roomTypeId?: string
): Promise<CalendarData> {
  const supabase = createSupabaseAdminClient();

  // Récupérer les chambres avec filtre optionnel par type
  let roomQuery = supabase
    .from("rooms")
    .select(
      `
      id, room_number, floor, status,
      room_type:room_types(id, name)
    `
    )
    .eq("establishment_id", establishmentId)
    .neq("status", "inactive")
    .order("room_number", { ascending: true });

  if (roomTypeId && roomTypeId !== "all") {
    roomQuery = roomQuery.eq("room_type_id", roomTypeId);
  }

  const { data: roomsData, error: roomsError } = await roomQuery;

  if (roomsError || !roomsData) {
    return { rooms: [], reservations: [] };
  }

  const rooms: CalendarRoom[] = (roomsData as any[]).map((r) => ({
    id: r.id,
    room_number: r.room_number,
    floor: r.floor,
    room_type_name: r.room_type?.name ?? null,
    status: r.status,
  }));

  const roomIds = rooms.map((r) => r.id);

  if (roomIds.length === 0) {
    return { rooms: [], reservations: [] };
  }

  // Récupérer les réservations qui chevauchent la plage
  // Logique : check_in_date <= endDate AND check_out_date > startDate
  const { data: reservationsData, error: resError } = await supabase
    .from("reservations")
    .select(
      `
      id, room_id, check_in_date, check_out_date, nights,
      total_amount, paid_amount, balance_amount, status, source,
      guest:guests(full_name, phone)
    `
    )
    .eq("establishment_id", establishmentId)
    .in("room_id", roomIds)
    .in("status", ["pending", "confirmed", "checked_in", "checked_out"])
    .lte("check_in_date", endDate)
    .gte("check_out_date", startDate)
    .order("check_in_date", { ascending: true });

  if (resError || !reservationsData) {
    return { rooms, reservations: [] };
  }

  const reservations: CalendarReservation[] = (reservationsData as any[]).map(
    (r) => ({
      id: r.id,
      room_id: r.room_id,
      guest_name: r.guest?.full_name ?? null,
      guest_phone: r.guest?.phone ?? null,
      check_in_date: r.check_in_date,
      check_out_date: r.check_out_date,
      nights: r.nights,
      total_amount: r.total_amount,
      paid_amount: r.paid_amount,
      balance_amount: r.balance_amount,
      status: r.status,
      source: r.source,
    })
  );

  return { rooms, reservations };
}

/**
 * Récupère les arrivées et départs du jour.
 */
export async function getTodayArrivalsDepartures(
  establishmentId: string
): Promise<{
  arrivals: CalendarReservation[];
  departures: CalendarReservation[];
}> {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: arrivalsData } = await supabase
    .from("reservations")
    .select(
      `
      id, room_id, check_in_date, check_out_date, nights,
      total_amount, paid_amount, balance_amount, status, source,
      guest:guests(full_name, phone),
      room:rooms(room_number)
    `
    )
    .eq("establishment_id", establishmentId)
    .eq("check_in_date", today)
    .in("status", ["confirmed", "checked_in"])
    .order("room:rooms(room_number)", { ascending: true });

  const { data: departuresData } = await supabase
    .from("reservations")
    .select(
      `
      id, room_id, check_in_date, check_out_date, nights,
      total_amount, paid_amount, balance_amount, status, source,
      guest:guests(full_name, phone),
      room:rooms(room_number)
    `
    )
    .eq("establishment_id", establishmentId)
    .eq("check_out_date", today)
    .in("status", ["checked_in", "checked_out"])
    .order("room:rooms(room_number)", { ascending: true });

  const mapReservation = (r: any): CalendarReservation => ({
    id: r.id,
    room_id: r.room_id,
    guest_name: r.guest?.full_name ?? null,
    guest_phone: r.guest?.phone ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
    source: r.source,
  });

  return {
    arrivals: (arrivalsData ?? []).map(mapReservation),
    departures: (departuresData ?? []).map(mapReservation),
  };
}

/**
 * Récupère les types de chambres pour le filtre.
 */
export async function getRoomTypesForCalendar(
  establishmentId: string
): Promise<{ id: string; name: string }[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("id, name")
    .eq("establishment_id", establishmentId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data as { id: string; name: string }[];
}
