/**
 * Types et constantes pour les paiements SaaS.
 * Safe côté client.
 */

export type PaymentMethod =
  | "orange"
  | "mtn"
  | "moov"
  | "wave"
  | "cash"
  | "card"
  | "transfer";

export type PaymentStatus =
  | "pending"
  | "validated"
  | "rejected"
  | "refunded";

export type SaaSPayment = {
  id: string;
  lead_id: string | null;
  establishment_id: string | null;
  plan_id: string;
  plan_name: string | null;
  amount_fcfa: number;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  validated_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  // Infos jointes
  lead_name: string | null;
  establishment_name: string | null;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  orange: "Orange Money",
  mtn: "MTN Money",
  moov: "Moov Money",
  wave: "Wave",
  cash: "Espèces",
  card: "Carte bancaire",
  transfer: "Virement",
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Money" },
  { value: "moov", label: "Moov Money" },
  { value: "wave", label: "Wave" },
  { value: "cash", label: "Espèces" },
  { value: "card", label: "Carte bancaire" },
  { value: "transfer", label: "Virement" },
];

export const PAYMENT_STATUS_LABELS: Record<
  PaymentStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  pending: { label: "En attente", variant: "warning" },
  validated: { label: "Validé", variant: "success" },
  rejected: { label: "Rejeté", variant: "destructive" },
  refunded: { label: "Remboursé", variant: "secondary" },
};

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "validated", label: "Validé" },
  { value: "rejected", label: "Rejeté" },
  { value: "refunded", label: "Remboursé" },
];
