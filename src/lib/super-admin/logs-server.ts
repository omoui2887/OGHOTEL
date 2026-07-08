import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Journal d'activité — SERVEUR UNIQUEMENT.
 * 🔒 Le Super Admin voit tous les logs globaux.
 */

export type ActivityLog = {
  id: string;
  establishment_id: string | null;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  // Infos jointes
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  establishment_name: string | null;
};

export const ACTION_LABELS: Record<string, string> = {
  // Super Admin
  "lead_status_changed": "Statut prospect modifié",
  "lead_notes_updated": "Notes prospect mises à jour",
  "saas_payment_created": "Paiement SaaS enregistré",
  "saas_payment_status_changed": "Statut paiement SaaS modifié",
  "activation_code_generated": "Code d'activation généré",
  "activation_code_status_changed": "Statut code modifié",
  "plan_updated": "Formule modifiée",
  // Admin Hôtel
  "reservation_created": "Réservation créée",
  "reservation_updated": "Réservation modifiée",
  "reservation_cancelled": "Réservation annulée",
  "check_in": "Check-in effectué",
  "check_out": "Check-out effectué",
  "stay_payment_created": "Paiement séjour enregistré",
  "expense_created": "Dépense ajoutée",
  "expense_updated": "Dépense modifiée",
  "expense_deleted": "Dépense supprimée",
  "housekeeping_task_created": "Tâche ménage créée",
  "housekeeping_task_updated": "Tâche ménage modifiée",
  "maintenance_ticket_created": "Ticket maintenance créé",
  "maintenance_ticket_updated": "Ticket maintenance modifié",
  "staff_user_created": "Utilisateur créé",
  "staff_user_updated": "Utilisateur modifié",
  "staff_user_deleted": "Utilisateur supprimé",
  "staff_password_reset": "Mot de passe réinitialisé",
  "establishment_settings_updated": "Paramètres établissement modifiés",
  "invoice_generated": "Facture générée",
  "invoice_cancelled": "Facture annulée",
  "account_activated": "Compte activé",
};

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
