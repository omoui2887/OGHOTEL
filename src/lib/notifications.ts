import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Notifications internes — calcul dynamique (pas de table dédiée).
 *
 * Phase 1 : notifications internes uniquement (badges + dropdown).
 * Phase 2 : email + WhatsApp Business API (à venir).
 *
 * 🔒 Les notifications Super Admin sont globales.
 *    Les notifications Admin Hôtel sont filtrées par establishment_id.
 */

export type Notification = {
  id: string;
  type: string;
  icon: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "danger" | "success";
  action_url?: string;
  action_label?: string;
};

export type NotificationsResult = {
  notifications: Notification[];
  unread_count: number;
};

// ─────────────────────────────────────────────────────────
// SUPER ADMIN NOTIFICATIONS
// ─────────────────────────────────────────────────────────

export async function getSuperAdminNotifications(): Promise<NotificationsResult> {
  const supabase = createSupabaseAdminClient();
  const notifications: Notification[] = [];

  // 1. Nouveaux prospects (status = new)
  const { count: newLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  if ((newLeads ?? 0) > 0) {
    notifications.push({
      id: "new-leads",
      type: "new_prospect",
      icon: "users",
      title: "Nouveaux prospects",
      description: `${newLeads} prospect(s) en attente de contact`,
      severity: "info",
      action_url: "/super-admin/leads",
      action_label: "Voir les prospects",
    });
  }

  // 2. Paiements en attente (status = pending)
  const { count: pendingPayments } = await supabase
    .from("subscription_payments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if ((pendingPayments ?? 0) > 0) {
    notifications.push({
      id: "pending-payments",
      type: "payment_pending",
      icon: "credit-card",
      title: "Paiements en attente",
      description: `${pendingPayments} paiement(s) à valider`,
      severity: "warning",
      action_url: "/super-admin/payments",
      action_label: "Valider les paiements",
    });
  }

  // 3. Abonnements expirant bientôt (≤ 30 jours)
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const { data: expiringEst } = await supabase
    .from("establishments")
    .select("id, name, subscription_end")
    .not("subscription_end", "is", null)
    .lte("subscription_end", in30Days.toISOString().split("T")[0])
    .gte("subscription_end", new Date().toISOString().split("T")[0]);

  if (expiringEst && expiringEst.length > 0) {
    notifications.push({
      id: "expiring-subscriptions",
      type: "subscription_expiring",
      icon: "clock",
      title: "Abonnements expirant bientôt",
      description: `${expiringEst.length} établissement(s) dans les 30 prochains jours`,
      severity: "warning",
      action_url: "/super-admin/clients",
      action_label: "Voir les clients",
    });
  }

  // 4. Codes expirés
  const { count: expiredCodes } = await supabase
    .from("activation_codes")
    .select("id", { count: "exact", head: true })
    .eq("status", "expired");

  if ((expiredCodes ?? 0) > 0) {
    notifications.push({
      id: "expired-codes",
      type: "code_expired",
      icon: "ticket",
      title: "Codes expirés",
      description: `${expiredCodes} code(s) d'activation expiré(s)`,
      severity: "danger",
      action_url: "/super-admin/activation-codes",
      action_label: "Voir les codes",
    });
  }

  return {
    notifications,
    unread_count: notifications.length,
  };
}

// ─────────────────────────────────────────────────────────
// ADMIN HÔTEL NOTIFICATIONS
// ─────────────────────────────────────────────────────────

export async function getHotelNotifications(
  establishmentId: string
): Promise<NotificationsResult> {
  const supabase = createSupabaseAdminClient();
  const notifications: Notification[] = [];
  const today = new Date().toISOString().split("T")[0];

  // 1. Arrivées du jour
  const { count: arrivals } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .eq("check_in_date", today)
    .in("status", ["confirmed", "checked_in"]);

  if ((arrivals ?? 0) > 0) {
    notifications.push({
      id: "arrivals-today",
      type: "arrivals",
      icon: "log-in",
      title: "Arrivées du jour",
      description: `${arrivals} client(s) attendu(s) aujourd'hui`,
      severity: "info",
      action_url: "/app/check-in",
      action_label: "Check-in",
    });
  }

  // 2. Départs du jour
  const { count: departures } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .eq("check_out_date", today)
    .in("status", ["checked_in", "checked_out"]);

  if ((departures ?? 0) > 0) {
    notifications.push({
      id: "departures-today",
      type: "departures",
      icon: "log-out",
      title: "Départs du jour",
      description: `${departures} client(s) à faire partir`,
      severity: "info",
      action_url: "/app/check-out",
      action_label: "Check-out",
    });
  }

  // 3. Chambres à nettoyer
  const { count: housekeeping } = await supabase
    .from("housekeeping_tasks")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .in("status", ["dirty", "in_progress"]);

  if ((housekeeping ?? 0) > 0) {
    notifications.push({
      id: "housekeeping-pending",
      type: "housekeeping",
      icon: "sparkles",
      title: "Chambres à nettoyer",
      description: `${housekeeping} chambre(s) en attente de nettoyage`,
      severity: "warning",
      action_url: "/app/housekeeping",
      action_label: "Voir le ménage",
    });
  }

  // 4. Tickets maintenance urgents
  const { count: urgentMaintenance } = await supabase
    .from("maintenance_tickets")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .eq("priority", "urgent")
    .in("status", ["open", "in_progress"]);

  if ((urgentMaintenance ?? 0) > 0) {
    notifications.push({
      id: "urgent-maintenance",
      type: "maintenance_urgent",
      icon: "wrench",
      title: "Maintenance urgente",
      description: `${urgentMaintenance} ticket(s) urgent(s) ouvert(s)`,
      severity: "danger",
      action_url: "/app/maintenance",
      action_label: "Voir les tickets",
    });
  }

  // 5. Paiements impayés (balance > 0)
  const { count: unpaid } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId)
    .in("status", ["confirmed", "checked_in", "checked_out"])
    .gt("balance_amount", 0);

  if ((unpaid ?? 0) > 0) {
    notifications.push({
      id: "unpaid-payments",
      type: "unpaid",
      icon: "alert-circle",
      title: "Paiements impayés",
      description: `${unpaid} réservation(s) avec solde restant`,
      severity: "warning",
      action_url: "/app/payments",
      action_label: "Voir les paiements",
    });
  }

  // 6. Abonnement OGHOTEL expirant bientôt
  const { data: est } = await supabase
    .from("establishments")
    .select("subscription_end")
    .eq("id", establishmentId)
    .single();

  if (est?.subscription_end) {
    const end = new Date(est.subscription_end);
    const now = new Date();
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      notifications.push({
        id: "subscription-expired",
        type: "subscription_expired",
        icon: "credit-card",
        title: "Abonnement expiré",
        description: "Votre abonnement OGHOTEL a expiré. Renouvelez-le dès maintenant.",
        severity: "danger",
        action_url: "/app/settings",
        action_label: "Renouveler",
      });
    } else if (daysLeft <= 30) {
      notifications.push({
        id: "subscription-expiring",
        type: "subscription_expiring",
        icon: "clock",
        title: "Abonnement expirant bientôt",
        description: `Il reste ${daysLeft} jour(s) avant l'expiration`,
        severity: "warning",
        action_url: "/app/settings",
        action_label: "Renouveler",
      });
    }
  }

  return {
    notifications,
    unread_count: notifications.length,
  };
}
