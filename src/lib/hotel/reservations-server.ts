import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  BLOCKING_STATUSES,
  datesOverlap,
  calculateNights,
  type Reservation,
  type ReservationStatus,
} from "./reservations";

/**
 * CRUD des réservations — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage manuel par establishment_id.
 *
 * RÈGLE CRITIQUE : aucune double réservation d'une même chambre sur des dates
 * qui se chevauchent. Vérification côté serveur dans createReservation et
 * updateReservation. Les statuts cancelled et no_show ne bloquent pas.
 */

export async function getReservations(
  establishmentId: string,
  filters: {
    search?: string;
    status?: string;
    room_id?: string;
    guest_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  reservations: Reservation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const {
    search,
    status,
    room_id,
    guest_id,
    date_from,
    date_to,
    page = 1,
    pageSize = 10,
  } = filters;

  let query = supabase
    .from("reservations")
    .select(
      `
      id, establishment_id, guest_id, room_id, check_in_date, check_out_date,
      nights, adults, children, rate_amount, discount_amount, total_amount,
      paid_amount, balance_amount, status, source, notes, created_by,
      created_at, updated_at,
      guest:guests(full_name, phone),
      room:rooms(room_number, room_type:room_types(name))
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (room_id && room_id !== "all") {
    query = query.eq("room_id", room_id);
  }

  if (guest_id && guest_id !== "all") {
    query = query.eq("guest_id", guest_id);
  }

  if (date_from) {
    query = query.gte("check_in_date", date_from);
  }

  if (date_to) {
    query = query.lte("check_in_date", date_to);
  }

  // Recherche par nom de client (nécessite un filtre sur guest)
  if (search && search.trim()) {
    // On ne peut pas faire or() avec une jointure facilement, donc on filtre
    // après coup. Pour la perf, on pourrait faire une sous-requête.
    // Ici on récupère les guests qui matchent puis on filtre.
    const s = search.trim();
    const { data: matchingGuests } = await supabase
      .from("guests")
      .select("id")
      .eq("establishment_id", establishmentId)
      .or(`full_name.ilike.%${s}%,phone.ilike.%${s}%`);

    const guestIds = (matchingGuests ?? []).map((g: any) => g.id);
    if (guestIds.length > 0) {
      query = query.in("guest_id", guestIds);
    } else {
      // Aucun client ne matche → retourner vide
      return { reservations: [], total: 0, page, pageSize, totalPages: 0 };
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("check_in_date", { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error("Erreur getReservations:", error);
    return { reservations: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const reservations: Reservation[] = (data as any[]).map((r) => ({
    id: r.id,
    establishment_id: r.establishment_id,
    guest_id: r.guest_id,
    guest_name: r.guest?.full_name ?? null,
    guest_phone: r.guest?.phone ?? null,
    room_id: r.room_id,
    room_number: r.room?.room_number ?? null,
    room_type_name: r.room?.room_type?.name ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    rate_amount: r.rate_amount,
    discount_amount: r.discount_amount,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
    source: r.source,
    notes: r.notes,
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  return {
    reservations,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getReservationById(
  id: string,
  establishmentId: string
): Promise<Reservation | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id, establishment_id, guest_id, room_id, check_in_date, check_out_date,
      nights, adults, children, rate_amount, discount_amount, total_amount,
      paid_amount, balance_amount, status, source, notes, created_by,
      created_at, updated_at,
      guest:guests(full_name, phone, email, nationality),
      room:rooms(room_number, room_type:room_types(name))
    `
    )
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .single();

  if (error || !data) return null;

  const r = data as any;
  return {
    id: r.id,
    establishment_id: r.establishment_id,
    guest_id: r.guest_id,
    guest_name: r.guest?.full_name ?? null,
    guest_phone: r.guest?.phone ?? null,
    room_id: r.room_id,
    room_number: r.room?.room_number ?? null,
    room_type_name: r.room?.room_type?.name ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    rate_amount: r.rate_amount,
    discount_amount: r.discount_amount,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
    source: r.source,
    notes: r.notes,
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

/**
 * Vérifie si une chambre est disponible pour les dates données.
 *
 * Règles :
 * - Les réservations avec statut cancelled ou no_show ne bloquent pas
 * - Les réservations checked_out ne bloquent pas non plus (séjour terminé)
 * - Les réservations pending, confirmed, checked_in bloquent
 * - On peut exclure une réservation (pour la modification)
 *
 * Retourne la liste des réservations en conflit (vide = disponible).
 */
export async function checkRoomAvailability(
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: string
): Promise<{ available: boolean; conflicts: { id: string; guest_name: string; check_in: string; check_out: string }[] }> {
  const supabase = createSupabaseAdminClient();

  // Récupérer toutes les réservations de cette chambre avec un statut bloquant
  let query = supabase
    .from("reservations")
    .select(
      `
      id, check_in_date, check_out_date, status,
      guest:guests(full_name)
    `
    )
    .eq("room_id", roomId)
    .in("status", BLOCKING_STATUSES);

  if (excludeReservationId) {
    query = query.neq("id", excludeReservationId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { available: false, conflicts: [] };
  }

  // Filtrer les conflits de dates côté applicatif (plus fiable que SQL)
  const conflicts = (data as any[])
    .filter((r) =>
      datesOverlap(checkInDate, checkOutDate, r.check_in_date, r.check_out_date)
    )
    .map((r) => ({
      id: r.id,
      guest_name: r.guest?.full_name ?? "—",
      check_in: r.check_in_date,
      check_out: r.check_out_date,
    }));

  return {
    available: conflicts.length === 0,
    conflicts,
  };
}

export async function createReservation(
  establishmentId: string,
  userId: string,
  input: {
    guest_id: string;
    room_id: string;
    check_in_date: string;
    check_out_date: string;
    adults: number;
    children: number;
    rate_amount: number;
    discount_amount?: number;
    paid_amount?: number;
    source: string;
    notes?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 1. Valider les dates
  const nights = calculateNights(input.check_in_date, input.check_out_date);
  if (nights <= 0) {
    return { success: false, error: "La date de départ doit être après la date d'arrivée" };
  }

  // 2. Vérifier la disponibilité de la chambre
  const availability = await checkRoomAvailability(
    input.room_id,
    input.check_in_date,
    input.check_out_date
  );

  if (!availability.available) {
    const conflictInfo = availability.conflicts
      .map(
        (c) =>
          `${c.guest_name} (${c.check_in} → ${c.check_out})`
      )
      .join(", ");
    return {
      success: false,
      error: `Cette chambre n'est pas disponible pour ces dates. Conflit avec : ${conflictInfo}`,
    };
  }

  // 3. Calculer les montants
  const discount = input.discount_amount ?? 0;
  const total = input.rate_amount * nights - discount;
  const paid = input.paid_amount ?? 0;
  const balance = total - paid;

  // 4. Insérer
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      establishment_id: establishmentId,
      guest_id: input.guest_id,
      room_id: input.room_id,
      check_in_date: input.check_in_date,
      check_out_date: input.check_out_date,
      nights,
      adults: input.adults,
      children: input.children,
      rate_amount: input.rate_amount,
      discount_amount: discount,
      total_amount: total,
      paid_amount: paid,
      balance_amount: balance,
      status: "confirmed",
      source: input.source,
      notes: input.notes?.trim() || null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[reservations] createReservation failed:", error.message);
    // 23P01 = exclusion_violation (contrainte no_overlap_reservations)
    // → la race TOCTOU a été rattrapée par la DB : un autre utilisateur
    //   a réservé la chambre entre le check et l'insert.
    if (error.code === "23P01") {
      return {
        success: false,
        error:
          "Cette chambre vient d'être réservée pour ces dates par un autre utilisateur. " +
          "Veuillez rafraîchir les disponibilités et réessayer.",
      };
    }
    // 23505 = unique_violation (contrainte d'unicité)
    if (error.code === "23505") {
      return {
        success: false,
        error: "Une réservation identique existe déjà.",
      };
    }
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "reservation_created",
    entity_type: "reservation",
    entity_id: data.id,
    metadata: { total_amount: total, nights },
  });

  return { success: true, id: data.id };
}

export async function updateReservation(
  id: string,
  establishmentId: string,
  userId: string,
  input: {
    guest_id?: string;
    room_id?: string;
    check_in_date?: string;
    check_out_date?: string;
    adults?: number;
    children?: number;
    rate_amount?: number;
    discount_amount?: number;
    paid_amount?: number;
    status?: ReservationStatus;
    source?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Récupérer la réservation actuelle
  const { data: current } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .single();

  if (!current) {
    return { success: false, error: "Réservation introuvable" };
  }

  // Si les dates ou la chambre changent, vérifier la disponibilité
  const newRoomId = input.room_id ?? current.room_id;
  const newCheckIn = input.check_in_date ?? current.check_in_date;
  const newCheckOut = input.check_out_date ?? current.check_out_date;

  const nights = calculateNights(newCheckIn, newCheckOut);
  if (nights <= 0) {
    return { success: false, error: "La date de départ doit être après la date d'arrivée" };
  }

  // Vérifier dispo si dates ou chambre ont changé
  if (
    input.room_id !== undefined ||
    input.check_in_date !== undefined ||
    input.check_out_date !== undefined
  ) {
    const availability = await checkRoomAvailability(
      newRoomId,
      newCheckIn,
      newCheckOut,
      id // exclure la réservation courante
    );

    if (!availability.available) {
      const conflictInfo = availability.conflicts
        .map((c) => `${c.guest_name} (${c.check_in} → ${c.check_out})`)
        .join(", ");
      return {
        success: false,
        error: `Conflit de réservation avec : ${conflictInfo}`,
      };
    }
  }

  // Calculer les nouveaux montants si nécessaire
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.guest_id !== undefined) updateData.guest_id = input.guest_id;
  if (input.room_id !== undefined) updateData.room_id = input.room_id;
  if (input.check_in_date !== undefined) updateData.check_in_date = input.check_in_date;
  if (input.check_out_date !== undefined) updateData.check_out_date = input.check_out_date;
  if (input.adults !== undefined) updateData.adults = input.adults;
  if (input.children !== undefined) updateData.children = input.children;
  if (input.source !== undefined) updateData.source = input.source;
  if (input.notes !== undefined) updateData.notes = input.notes.trim() || null;
  if (input.status !== undefined) updateData.status = input.status;

  // Recalculer si tarif/remise/dates changent
  const rateAmount = input.rate_amount ?? current.rate_amount;
  const discount = input.discount_amount ?? current.discount_amount;
  if (
    input.rate_amount !== undefined ||
    input.discount_amount !== undefined ||
    input.check_in_date !== undefined ||
    input.check_out_date !== undefined
  ) {
    updateData.nights = nights;
    updateData.rate_amount = rateAmount;
    updateData.discount_amount = discount;
    updateData.total_amount = rateAmount * nights - discount;
  }

  // Si acompte change, recalculer le solde
  if (input.paid_amount !== undefined) {
    const total = (updateData.total_amount as number) ?? current.total_amount;
    updateData.paid_amount = input.paid_amount;
    updateData.balance_amount = total - input.paid_amount;
  }

  const { error } = await supabase
    .from("reservations")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[reservations] updateReservation failed:", error.message);
    if (error.code === "23P01") {
      return {
        success: false,
        error:
          "Cette chambre vient d'être réservée pour ces dates par un autre utilisateur. " +
          "Veuillez rafraîchir les disponibilités et réessayer.",
      };
    }
    if (error.code === "23505") {
      return {
        success: false,
        error: "Une réservation identique existe déjà.",
      };
    }
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "reservation_updated",
    entity_type: "reservation",
    entity_id: id,
    metadata: { updated_fields: Object.keys(input) },
  });

  return { success: true };
}

export async function cancelReservation(
  id: string,
  establishmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("reservations")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .in("status", ["pending", "confirmed"]); // ne peut annuler que si pas encore arrivé

  if (error) {
    console.error("[reservations] cancelReservation failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Libérer la chambre si elle était juste « reserved »
  // (si occupée / cleaning / maintenance, on ne touche pas)
  const { data: reservation } = await supabase
    .from("reservations")
    .select("room_id")
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .single();

  if (reservation?.room_id) {
    const { data: room } = await supabase
      .from("rooms")
      .select("status")
      .eq("id", reservation.room_id)
      .eq("establishment_id", establishmentId)
      .single();

    if (room && room.status === "reserved") {
      await supabase
        .from("rooms")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", reservation.room_id)
        .eq("establishment_id", establishmentId);
    }
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "reservation_cancelled",
    entity_type: "reservation",
    entity_id: id,
  });

  return { success: true };
}
