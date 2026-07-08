/**
 * Types et constantes pour les réservations.
 * Safe côté client.
 */

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

export type ReservationSource =
  | "direct"
  | "phone"
  | "whatsapp"
  | "agency"
  | "other";

export type Reservation = {
  id: string;
  establishment_id: string;
  guest_id: string;
  guest_name: string | null;
  guest_phone: string | null;
  room_id: string;
  room_number: string | null;
  room_type_name: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  adults: number;
  children: number;
  rate_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: ReservationStatus;
  source: ReservationSource;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const RESERVATION_STATUS_LABELS: Record<
  ReservationStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  pending: { label: "En attente", variant: "warning" },
  confirmed: { label: "Confirmée", variant: "default" },
  checked_in: { label: "Arrivé", variant: "success" },
  checked_out: { label: "Terminé", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
  no_show: { label: "No-show", variant: "destructive" },
};

export const RESERVATION_STATUS_OPTIONS: {
  value: ReservationStatus;
  label: string;
}[] = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "checked_in", label: "Arrivé" },
  { value: "checked_out", label: "Terminé" },
  { value: "cancelled", label: "Annulée" },
  { value: "no_show", label: "No-show" },
];

export const RESERVATION_SOURCE_LABELS: Record<ReservationSource, string> = {
  direct: "Direct",
  phone: "Téléphone",
  whatsapp: "WhatsApp",
  agency: "Agence",
  other: "Autre",
};

export const RESERVATION_SOURCE_OPTIONS: {
  value: ReservationSource;
  label: string;
}[] = [
  { value: "direct", label: "Direct (sur place)" },
  { value: "phone", label: "Téléphone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "agency", label: "Agence" },
  { value: "other", label: "Autre" },
];

/**
 * Statuts qui bloquent une chambre (empêchent une autre réservation
 * sur les mêmes dates). Les statuts cancelled et no_show ne bloquent pas.
 */
export const BLOCKING_STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
  // checked_out ne bloque plus (le séjour est terminé)
  // cancelled ne bloque pas
  // no_show ne bloque pas
];

/**
 * Calcule le nombre de nuits entre 2 dates.
 * checkOut doit être après checkIn.
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Vérifie si deux plages de dates se chevauchent.
 * Logique : plage A chevauche plage B si A.start < B.end AND A.end > B.start
 */
export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = new Date(startA);
  const aEnd = new Date(endA);
  const bStart = new Date(startB);
  const bEnd = new Date(endB);
  return aStart < bEnd && aEnd > bStart;
}
