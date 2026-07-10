import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Room } from "./rooms";

/**
 * CRUD des chambres — SERVEUR UNIQUEMENT.
 *
 * 🔒 Utilise le client admin avec filtrage manuel par establishment_id.
 */

export async function getRooms(establishmentId: string): Promise<Room[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
      id, establishment_id, room_type_id, room_number, floor, capacity,
      price_per_night, half_day_price, status, amenities, photos, notes,
      created_at, updated_at,
      room_type:room_types(name)
    `
    )
    .eq("establishment_id", establishmentId)
    .order("room_number", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    establishment_id: r.establishment_id,
    room_type_id: r.room_type_id,
    room_type_name: r.room_type?.name ?? null,
    room_number: r.room_number,
    floor: r.floor,
    capacity: r.capacity,
    price_per_night: r.price_per_night,
    half_day_price: r.half_day_price,
    status: r.status,
    amenities: r.amenities ?? [],
    photos: r.photos ?? [],
    notes: r.notes,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function createRoom(
  establishmentId: string,
  input: {
    room_type_id: string;
    room_number: string;
    floor?: string;
    capacity: number;
    price_per_night: number;
    half_day_price?: number;
    amenities?: string[];
    notes?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 🔒 Vérifier que room_type_id appartient bien à cet établissement
  const { data: roomType } = await supabase
    .from("room_types")
    .select("id")
    .eq("id", input.room_type_id)
    .eq("establishment_id", establishmentId)
    .maybeSingle();
  if (!roomType) {
    return { success: false, error: "Type de chambre introuvable dans votre établissement" };
  }

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      establishment_id: establishmentId,
      room_type_id: input.room_type_id,
      room_number: input.room_number.trim(),
      floor: input.floor?.trim() || null,
      capacity: input.capacity,
      price_per_night: input.price_per_night,
      half_day_price: input.half_day_price || null,
      status: "available",
      amenities: input.amenities ?? [],
      photos: [],
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    // Contrainte unique (establishment_id, room_number)
    if (error.code === "23505") {
      return { success: false, error: "Une chambre avec ce numéro existe déjà" };
    }
    console.error("[rooms] createRoom failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true, id: data.id };
}

export async function updateRoom(
  id: string,
  establishmentId: string,
  input: {
    room_type_id?: string;
    room_number?: string;
    floor?: string;
    capacity?: number;
    price_per_night?: number;
    half_day_price?: number | null;
    status?: string;
    amenities?: string[];
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.room_type_id !== undefined) updateData.room_type_id = input.room_type_id;
  if (input.room_number !== undefined) updateData.room_number = input.room_number.trim();
  if (input.floor !== undefined) updateData.floor = input.floor.trim() || null;
  if (input.capacity !== undefined) updateData.capacity = input.capacity;
  if (input.price_per_night !== undefined) updateData.price_per_night = input.price_per_night;
  if (input.half_day_price !== undefined) {
    updateData.half_day_price =
      input.half_day_price === null || input.half_day_price === 0
        ? null
        : input.half_day_price;
  }
  if (input.status !== undefined) updateData.status = input.status;
  if (input.amenities !== undefined) updateData.amenities = input.amenities;
  if (input.notes !== undefined) updateData.notes = input.notes.trim() || null;

  const { error } = await supabase
    .from("rooms")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Une chambre avec ce numéro existe déjà" };
    }
    console.error("[rooms] updateRoom failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true };
}

export async function deleteRoom(
  id: string,
  establishmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Vérifier qu'aucune réservation active n'utilise cette chambre
  const { count } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("room_id", id)
    .in("status", ["pending", "confirmed", "checked_in"]);

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `Impossible de supprimer : ${count} réservation(s) active(s) sur cette chambre. Désactivez-la plutôt.`,
    };
  }

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[rooms] deleteRoom failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true };
}
