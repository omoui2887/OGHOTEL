import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { HousekeepingTask, HousekeepingStatus } from "./housekeeping";

/**
 * CRUD des tâches de ménage — SERVEUR UNIQUEMENT.
 */

export async function getHousekeepingTasks(
  establishmentId: string,
  filters: { status?: string; page?: number; pageSize?: number } = {}
): Promise<{
  tasks: HousekeepingTask[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { status, page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from("housekeeping_tasks")
    .select(
      `
      id, establishment_id, room_id, assigned_to, status, notes,
      created_at, completed_at,
      room:rooms(room_number, status, room_type:room_types(name)),
      assignee:profiles(full_name)
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { tasks: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const tasks: HousekeepingTask[] = (data as any[]).map((t) => ({
    id: t.id,
    establishment_id: t.establishment_id,
    room_id: t.room_id,
    room_number: t.room?.room_number ?? null,
    room_type_name: t.room?.room_type?.name ?? null,
    room_status: t.room?.status ?? null,
    assigned_to: t.assigned_to,
    assigned_to_name: t.assignee?.full_name ?? null,
    status: t.status,
    notes: t.notes,
    created_at: t.created_at,
    completed_at: t.completed_at,
  }));

  return {
    tasks,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function createHousekeepingTask(
  establishmentId: string,
  userId: string,
  input: {
    room_id: string;
    notes?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 🔒 Vérifier que room_id appartient bien à cet établissement
  if (input.room_id) {
    const { data: room } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", input.room_id)
      .eq("establishment_id", establishmentId)
      .maybeSingle();
    if (!room) {
      return { success: false, error: "Chambre introuvable dans votre établissement" };
    }
  }

  const { data, error } = await supabase
    .from("housekeeping_tasks")
    .insert({
      establishment_id: establishmentId,
      room_id: input.room_id,
      status: "dirty",
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[housekeeping] createHousekeepingTask failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "housekeeping_task_created",
    entity_type: "housekeeping_task",
    entity_id: data.id,
  });

  return { success: true, id: data.id };
}

export async function updateHousekeepingTask(
  id: string,
  establishmentId: string,
  userId: string,
  input: {
    status?: HousekeepingStatus;
    assigned_to?: string | null;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {};
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === "clean" || input.status === "inspected") {
      updateData.completed_at = new Date().toISOString();
    }
  }
  if (input.assigned_to !== undefined) {
    updateData.assigned_to = input.assigned_to;
  }
  if (input.notes !== undefined) {
    updateData.notes = input.notes.trim() || null;
  }

  const { error } = await supabase
    .from("housekeeping_tasks")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[housekeeping] updateHousekeepingTask failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Si la tâche passe à "inspected", remettre la chambre en "available"
  if (input.status === "inspected") {
    // Récupérer le room_id
    const { data: task } = await supabase
      .from("housekeeping_tasks")
      .select("room_id")
      .eq("id", id)
      .single();

    if (task) {
      await supabase
        .from("rooms")
        .update({ status: "available", updated_at: new Date().toISOString() })
        .eq("id", task.room_id)
        .eq("establishment_id", establishmentId);
    }
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "housekeeping_task_updated",
    entity_type: "housekeeping_task",
    entity_id: id,
    metadata: { updated_fields: Object.keys(input) },
  });

  return { success: true };
}

export async function deleteHousekeepingTask(
  id: string,
  establishmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("housekeeping_tasks")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[housekeeping] deleteHousekeepingTask failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "housekeeping_task_deleted",
    entity_type: "housekeeping_task",
    entity_id: id,
  });

  return { success: true };
}
