/**
 * Types et constantes pour le ménage.
 * Safe côté client.
 */

export type HousekeepingStatus = "dirty" | "in_progress" | "clean" | "inspected";

export type HousekeepingTask = {
  id: string;
  establishment_id: string;
  room_id: string;
  room_number: string | null;
  room_type_name: string | null;
  room_status: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  status: HousekeepingStatus;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
};

export const HOUSEKEEPING_STATUS_LABELS: Record<
  HousekeepingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  dirty: { label: "À nettoyer", variant: "destructive" },
  in_progress: { label: "En cours", variant: "warning" },
  clean: { label: "Propre", variant: "success" },
  inspected: { label: "Inspecté", variant: "default" },
};

export const HOUSEKEEPING_STATUS_OPTIONS: {
  value: HousekeepingStatus;
  label: string;
}[] = [
  { value: "dirty", label: "À nettoyer" },
  { value: "in_progress", label: "En cours" },
  { value: "clean", label: "Propre" },
  { value: "inspected", label: "Inspecté" },
];
