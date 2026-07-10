import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Guest } from "./guests";

/**
 * CRUD des clients hébergés — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage manuel par establishment_id (provenant du profil authentifié).
 */

export async function getGuests(
  establishmentId: string,
  filters: { search?: string; page?: number; pageSize?: number } = {}
): Promise<{
  guests: Guest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { search, page = 1, pageSize = 10 } = filters;

  let query = supabase
    .from("guests")
    .select("*", { count: "exact" })
    .eq("establishment_id", establishmentId);

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(
      `full_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,id_number.ilike.%${s}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { guests: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const guests: Guest[] = (data as any[]).map((g) => ({
    id: g.id,
    establishment_id: g.establishment_id,
    full_name: g.full_name,
    phone: g.phone,
    email: g.email,
    nationality: g.nationality,
    id_type: g.id_type,
    id_number: g.id_number,
    address: g.address,
    notes: g.notes,
    created_at: g.created_at,
    updated_at: g.updated_at,
  }));

  return {
    guests,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getGuestById(
  id: string,
  establishmentId: string
): Promise<Guest | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .single();

  if (error || !data) return null;

  const g = data as any;
  return {
    id: g.id,
    establishment_id: g.establishment_id,
    full_name: g.full_name,
    phone: g.phone,
    email: g.email,
    nationality: g.nationality,
    id_type: g.id_type,
    id_number: g.id_number,
    address: g.address,
    notes: g.notes,
    created_at: g.created_at,
    updated_at: g.updated_at,
  };
}

export type GuestReservation = {
  id: string;
  room_number: string;
  room_type_name: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: string;
};

export type GuestPayment = {
  id: string;
  reservation_id: string;
  room_number: string;
  amount: number;
  method: string;
  payment_date: string;
  reference: string | null;
};

export async function getGuestReservations(
  guestId: string,
  establishmentId: string
): Promise<GuestReservation[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id, check_in_date, check_out_date, nights, total_amount, paid_amount,
      balance_amount, status,
      room:rooms(room_number, room_type:room_types(name))
    `
    )
    .eq("guest_id", guestId)
    .eq("establishment_id", establishmentId)
    .order("check_in_date", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    room_number: r.room?.room_number ?? "—",
    room_type_name: r.room?.room_type?.name ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
  }));
}

export async function getGuestPayments(
  guestId: string,
  establishmentId: string
): Promise<GuestPayment[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("stay_payments")
    .select(
      `
      id, reservation_id, amount, method, payment_date, reference,
      reservation:reservations(room_id, room:rooms(room_number))
    `
    )
    .eq("establishment_id", establishmentId)
    .eq("reservation.guest_id", guestId)
    .order("payment_date", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return (data as any[]).map((p) => ({
    id: p.id,
    reservation_id: p.reservation_id,
    room_number: p.reservation?.room?.room_number ?? "—",
    amount: p.amount,
    method: p.method,
    payment_date: p.payment_date,
    reference: p.reference,
  }));
}

export async function createGuest(
  establishmentId: string,
  input: {
    full_name: string;
    phone: string;
    email?: string | null;
    nationality?: string | null;
    id_type?: string | null;
    id_number?: string | null;
    address?: string | null;
    notes?: string | null;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("guests")
    .insert({
      establishment_id: establishmentId,
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      nationality: input.nationality?.trim() || null,
      id_type: (input.id_type as any) || null,
      id_number: input.id_number?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[guests] createGuest failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true, id: data.id };
}

export async function updateGuest(
  id: string,
  establishmentId: string,
  input: {
    full_name?: string;
    phone?: string;
    email?: string;
    nationality?: string;
    id_type?: string;
    id_number?: string;
    address?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.full_name !== undefined) updateData.full_name = input.full_name.trim();
  if (input.phone !== undefined) updateData.phone = input.phone.trim();
  if (input.email !== undefined) updateData.email = input.email.trim() || null;
  if (input.nationality !== undefined) updateData.nationality = input.nationality.trim() || null;
  if (input.id_type !== undefined) updateData.id_type = (input.id_type as any) || null;
  if (input.id_number !== undefined) updateData.id_number = input.id_number.trim() || null;
  if (input.address !== undefined) updateData.address = input.address.trim() || null;
  if (input.notes !== undefined) updateData.notes = input.notes.trim() || null;

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[guests] updateGuest failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true };
}

export async function deleteGuest(
  id: string,
  establishmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Vérifier qu'aucune réservation n'est liée
  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("guest_id", id)
    .eq("establishment_id", establishmentId);

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `Impossible de supprimer : ${count} réservation(s) liée(s) à ce client.`,
    };
  }

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[guests] deleteGuest failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true };
}
