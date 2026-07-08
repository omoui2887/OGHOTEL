/**
 * Types et constantes pour les clients hébergés.
 * Safe côté client.
 */

export type IdType = "cni" | "passport" | "permit" | "other";

export type Guest = {
  id: string;
  establishment_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  nationality: string | null;
  id_type: IdType | null;
  id_number: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Stats (optionnel)
  reservations_count?: number;
  total_paid?: number;
};

export const ID_TYPE_LABELS: Record<IdType, string> = {
  cni: "CNI",
  passport: "Passeport",
  permit: "Permis",
  other: "Autre",
};

export const ID_TYPE_OPTIONS: { value: IdType; label: string }[] = [
  { value: "cni", label: "CNI (Carte Nationale d'Identité)" },
  { value: "passport", label: "Passeport" },
  { value: "permit", label: "Permis de conduire" },
  { value: "other", label: "Autre" },
];

export const COMMON_NATIONALITIES = [
  "Ivoirienne",
  "Française",
  "Sénégalaise",
  "Malienne",
  "Burkinabè",
  "Guinéenne",
  "Nigériane",
  "Ghanéenne",
  "Libanaise",
  "Chinoise",
  "Autre",
] as const;
