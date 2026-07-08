/**
 * Types et constantes pour les paiements séjour.
 * Safe côté client.
 */

export type PaymentMethod =
  | "cash"
  | "orange"
  | "mtn"
  | "moov"
  | "wave"
  | "card"
  | "transfer";

export type StayPayment = {
  id: string;
  establishment_id: string;
  reservation_id: string;
  guest_name: string | null;
  guest_phone: string | null;
  room_number: string | null;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  payment_date: string;
  received_by: string | null;
  notes: string | null;
  created_at: string;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  orange: "Orange Money",
  mtn: "MTN Money",
  moov: "Moov Money",
  wave: "Wave",
  card: "Carte bancaire",
  transfer: "Virement",
};

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Espèces" },
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Money" },
  { value: "moov", label: "Moov Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
  { value: "transfer", label: "Virement" },
];

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  cash: "💵",
  orange: "🟠",
  mtn: "🟡",
  moov: "🔵",
  wave: "🌊",
  card: "💳",
  transfer: "🏦",
};
