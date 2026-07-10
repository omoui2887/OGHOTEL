import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { MaintenanceTicket, MaintenanceStatus, MaintenancePriority } from "./maintenance";

/**
 * CRUD des tickets de maintenance — SERVEUR UNIQUEMENT.
 */

export async function getMaintenanceTickets(
  establishmentId: string,
  filters: { status?: string; priority?: string; page?: number; pageSize?: number } = {}
): Promise<{
  tickets: MaintenanceTicket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { status, priority, page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from("maintenance_tickets")
    .select(
      `
      id, establishment_id, room_id, title, description, priority, status,
      cost, assigned_to, created_by, resolved_at, created_at, updated_at,
      room:rooms(room_number),
      assignee:profiles!maintenance_tickets_assigned_to_fkey(full_name),
      creator:profiles!maintenance_tickets_created_by_fkey(full_name)
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (priority && priority !== "all") {
    query = query.eq("priority", priority);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { tickets: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const tickets: MaintenanceTicket[] = (data as any[]).map((t) => ({
    id: t.id,
    establishment_id: t.establishment_id,
    room_id: t.room_id,
    room_number: t.room?.room_number ?? null,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    cost: t.cost,
    assigned_to: t.assigned_to,
    assigned_to_name: t.assignee?.full_name ?? null,
    created_by: t.created_by,
    created_by_name: t.creator?.full_name ?? null,
    resolved_at: t.resolved_at,
    created_at: t.created_at,
    updated_at: t.updated_at,
  }));

  return {
    tickets,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function createMaintenanceTicket(
  establishmentId: string,
  userId: string,
  input: {
    room_id?: string | null;
    title: string;
    description?: string;
    priority: MaintenancePriority;
    cost?: number;
    setRoomMaintenance?: boolean;
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
    .from("maintenance_tickets")
    .insert({
      establishment_id: establishmentId,
      room_id: input.room_id || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority,
      status: "open",
      cost: input.cost || 0,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[maintenance] createMaintenanceTicket failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Si demandé, passer la chambre en maintenance
  if (input.setRoomMaintenance && input.room_id) {
    await supabase
      .from("rooms")
      .update({ status: "maintenance", updated_at: new Date().toISOString() })
      .eq("id", input.room_id)
      .eq("establishment_id", establishmentId);
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "maintenance_ticket_created",
    entity_type: "maintenance_ticket",
    entity_id: data.id,
    metadata: { title: input.title, priority: input.priority },
  });

  return { success: true, id: data.id };
}

export async function updateMaintenanceTicket(
  id: string,
  establishmentId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    priority?: MaintenancePriority;
    status?: MaintenanceStatus;
    cost?: number;
    assigned_to?: string | null;
    setRoomMaintenance?: boolean;
    setRoomAvailable?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.description !== undefined) updateData.description = input.description.trim() || null;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.cost !== undefined) updateData.cost = input.cost;
  if (input.assigned_to !== undefined) updateData.assigned_to = input.assigned_to;

  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("maintenance_tickets")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[maintenance] updateMaintenanceTicket failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Gérer le statut de la chambre
  const { data: ticket } = await supabase
    .from("maintenance_tickets")
    .select("room_id")
    .eq("id", id)
    .single();

  if (ticket?.room_id) {
    if (input.setRoomMaintenance) {
      await supabase
        .from("rooms")
        .update({ status: "maintenance", updated_at: new Date().toISOString() })
        .eq("id", ticket.room_id)
        .eq("establishment_id", establishmentId);
    } else if (input.setRoomAvailable || input.status === "resolved") {
      // Quand le ticket est résolu, on ne remet la chambre en "available"
      // que s'il n'y a pas d'AUTRE ticket ouvert/in_progress sur la même chambre.
      const { count: openCount } = await supabase
        .from("maintenance_tickets")
        .select("id", { count: "exact", head: true })
        .eq("room_id", ticket.room_id)
        .eq("establishment_id", establishmentId)
        .in("status", ["open", "in_progress"])
        .neq("id", id);

      if ((openCount ?? 0) === 0) {
        await supabase
          .from("rooms")
          .update({ status: "available", updated_at: new Date().toISOString() })
          .eq("id", ticket.room_id)
          .eq("establishment_id", establishmentId);
      }
    }
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "maintenance_ticket_updated",
    entity_type: "maintenance_ticket",
    entity_id: id,
    metadata: { updated_fields: Object.keys(input) },
  });

  return { success: true };
}

export async function deleteMaintenanceTicket(
  id: string,
  establishmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("maintenance_tickets")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[maintenance] deleteMaintenanceTicket failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "maintenance_ticket_deleted",
    entity_type: "maintenance_ticket",
    entity_id: id,
  });

  return { success: true };
}
