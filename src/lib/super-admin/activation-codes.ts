/**
 * Types et constantes pour les codes d'activation.
 * Safe côté client.
 */

export type ActivationCodeStatus =
  | "generated"
  | "sent"
  | "used"
  | "expired"
  | "cancelled";

export type ActivationCode = {
  id: string;
  code: string;
  lead_id: string | null;
  establishment_id: string | null;
  plan_id: string;
  plan_name: string | null;
  payment_id: string | null;
  amount_fcfa: number;
  status: ActivationCodeStatus;
  expires_at: string;
  used_at: string | null;
  created_by: string | null;
  created_at: string;
  // Infos jointes
  lead_name: string | null;
  establishment_name: string | null;
};

export const CODE_STATUS_LABELS: Record<
  ActivationCodeStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  generated: { label: "Généré", variant: "default" },
  sent: { label: "Envoyé", variant: "secondary" },
  used: { label: "Utilisé", variant: "success" },
  expired: { label: "Expiré", variant: "destructive" },
  cancelled: { label: "Annulé", variant: "outline" },
};

export const CODE_STATUS_OPTIONS: { value: ActivationCodeStatus; label: string }[] = [
  { value: "generated", label: "Généré" },
  { value: "sent", label: "Envoyé" },
  { value: "used", label: "Utilisé" },
  { value: "expired", label: "Expiré" },
  { value: "cancelled", label: "Annulé" },
];

/**
 * Génère un code au format OGH-YYYY-XXXXXX
 * où XXXXXX est alphanumérique (36^6 combinaisons).
 */
export function generateActivationCodeFormat(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0, 1, I, O pour lisibilité
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `OGH-${year}-${random}`;
}
