/**
 * Types et constantes pour le journal d'activité.
 * Safe côté client (pas d'import serveur).
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
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  establishment_name: string | null;
};

export const ACTION_LABELS: Record<string, string> = {
  "lead_status_changed": "Statut prospect modifié",
  "lead_notes_updated": "Notes prospect mises à jour",
  "saas_payment_created": "Paiement SaaS enregistré",
  "saas_payment_status_changed": "Statut paiement SaaS modifié",
  "activation_code_generated": "Code d'activation généré",
  "activation_code_status_changed": "Statut code modifié",
  "plan_updated": "Formule modifiée",
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
