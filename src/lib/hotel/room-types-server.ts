import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { RoomType } from "./room-types";

/**
 * CRUD des types de chambres — SERVEUR UNIQUEMENT.
 *
 * 🔒 Utilise le client admin avec filtrage manuel par establishment_id.
 *    L'establishment_id provient du profil authentifié (getCurrentProfile),
 *    il est impossible pour un client de le falsifier.
 */

export async function getRoomTypes(establishmentId: string): Promise<RoomType[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Récupérer le nombre de chambres par type
  const { data: rooms } = await supabase
    .from("rooms")
    .select("room_type_id")
    .eq("establishment_id", establishmentId);

  const counts = new Map<string, number>();
  (rooms ?? []).forEach((r: any) => {
    counts.set(r.room_type_id, (counts.get(r.room_type_id) || 0) + 1);
  });

  return (data as any[]).map((t) => ({
    id: t.id,
    establishment_id: t.establishment_id,
    name: t.name,
    default_price: t.default_price,
    capacity: t.capacity,
    description: t.description,
    photos: t.photos ?? [],
    is_active: t.is_active,
    created_at: t.created_at,
    updated_at: t.updated_at,
    rooms_count: counts.get(t.id) || 0,
  }));
}

export async function createRoomType(
  establishmentId: string,
  input: {
    name: string;
    default_price: number;
    capacity: number;
    description?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("room_types")
    .insert({
      establishment_id: establishmentId,
      name: input.name.trim(),
      default_price: input.default_price,
      capacity: input.capacity,
      description: input.description?.trim() || null,
      photos: [],
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

export async function updateRoomType(
  id: string,
  establishmentId: string,
  input: {
    name?: string;
    default_price?: number;
    capacity?: number;
    description?: string;
    is_active?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.default_price !== undefined) updateData.default_price = input.default_price;
  if (input.capacity !== undefined) updateData.capacity = input.capacity;
  if (input.description !== undefined) updateData.description = input.description.trim() || null;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const { error } = await supabase
    .from("room_types")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId); // sécurité : ne modifie que si appartient à l'établissement

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteRoomType(
  id: string,
  establishmentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Vérifier qu'aucune chambre n'utilise ce type
  const { count } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true })
    .eq("room_type_id", id)
    .eq("establishment_id", establishmentId);

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `Impossible de supprimer : ${count} chambre(s) utilisent ce type. Désactivez-le plutôt.`,
    };
  }

  const { error } = await supabase
    .from("room_types")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
