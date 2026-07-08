import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ACTION_LABELS, type ActivityLog } from "./logs";

export { ACTION_LABELS, type ActivityLog };

/**
 * Journal d'activité — SERVEUR UNIQUEMENT.
 * 🔒 Le Super Admin voit tous les logs globaux.
 */

export async function getActivityLogs(
  filters: {
    action?: string;
    user_id?: string;
    establishment_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { action, user_id, establishment_id, date_from, date_to, page = 1, pageSize = 30 } = filters;

  let query = supabase
    .from("activity_logs")
    .select(
      `
      id, establishment_id, user_id, action, entity_type, entity_id, metadata, created_at,
      user:profiles!activity_logs_user_id_fkey(full_name, email, role),
      establishment:establishments(name)
    `,
      { count: "exact" }
    );

  if (action && action !== "all") {
    query = query.eq("action", action);
  }

  if (user_id && user_id !== "all") {
    query = query.eq("user_id", user_id);
  }

  if (establishment_id && establishment_id !== "all") {
    query = query.eq("establishment_id", establishment_id);
  }

  if (date_from) {
    query = query.gte("created_at", date_from + "T00:00:00.000Z");
  }

  if (date_to) {
    query = query.lte("created_at", date_to + "T23:59:59.999Z");
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error("Erreur getActivityLogs:", error);
    return { logs: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const logs: ActivityLog[] = (data as any[]).map((l) => ({
    id: l.id,
    establishment_id: l.establishment_id,
    user_id: l.user_id,
    action: l.action,
    entity_type: l.entity_type,
    entity_id: l.entity_id,
    metadata: l.metadata ?? {},
    created_at: l.created_at,
    user_name: l.user?.full_name ?? null,
    user_email: l.user?.email ?? null,
    user_role: l.user?.role ?? null,
    establishment_name: l.establishment?.name ?? null,
  }));

  return {
    logs,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Récupère les logs d'un établissement spécifique (pour /app).
 */
export async function getEstablishmentLogs(
  establishmentId: string,
  filters: {
    action?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return getActivityLogs({
    ...filters,
    establishment_id: establishmentId,
  });
}
