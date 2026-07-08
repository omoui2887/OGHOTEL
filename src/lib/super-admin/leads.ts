/**
 * Types et constantes partagés pour la gestion des prospects (leads).
 *
 * Ce fichier est SAFE côté client (pas d'import serveur).
 * Les fonctions de fetch sont dans leads-server.ts (serveur uniquement).
 */

export type Lead = {
  id: string;
  full_name: string;
  business_name: string;
  business_type: string;
  city: string | null;
  rooms_count: number | null;
  phone: string;
  email: string | null;
  desired_plan_id: string | null;
  desired_plan_name: string | null;
  message: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadFilters = {
  search?: string;
  status?: string;
  city?: string;
  plan_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
};

export type LeadsResult = {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type LeadActivity = {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user_email: string | null;
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  hotel: "Hôtel",
  residence: "Résidence",
  auberge: "Auberge",
  other: "Autre",
};

export function getBusinessTypeLabel(type: string): string {
  return BUSINESS_TYPE_LABELS[type] ?? type;
}

export const LEAD_STATUS_LABELS: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  new: { label: "Nouveau", variant: "default" },
  contacted: { label: "Contacté", variant: "secondary" },
  negotiating: { label: "Négociation", variant: "warning" },
  won: { label: "Gagné", variant: "success" },
  lost: { label: "Perdu", variant: "destructive" },
};

export const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "negotiating", label: "Négociation" },
  { value: "won", label: "Gagné" },
  { value: "lost", label: "Perdu" },
] as const;
