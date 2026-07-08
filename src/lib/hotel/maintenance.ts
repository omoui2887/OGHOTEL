/**
 * Types et constantes pour la maintenance.
 * Safe côté client.
 */

export type MaintenancePriority = "low" | "normal" | "urgent";
export type MaintenanceStatus = "open" | "in_progress" | "resolved";

export type MaintenanceTicket = {
  id: string;
  establishment_id: string;
  room_id: string | null;
  room_number: string | null;
  title: string;
  description: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  cost: number;
  assigned_to: string | null;
  assigned_to_name: string | null;
  created_by: string | null;
  created_by_name: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export const PRIORITY_LABELS: Record<
  MaintenancePriority,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "warning";
  }
> = {
  low: { label: "Faible", variant: "secondary" },
  normal: { label: "Normale", variant: "default" },
  urgent: { label: "Urgente", variant: "destructive" },
};

export const PRIORITY_OPTIONS: { value: MaintenancePriority; label: string }[] = [
  { value: "low", label: "Faible" },
  { value: "normal", label: "Normale" },
  { value: "urgent", label: "Urgente" },
];

export const MAINTENANCE_STATUS_LABELS: Record<
  MaintenanceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
> = {
  open: { label: "Ouvert", variant: "warning" },
  in_progress: { label: "En cours", variant: "default" },
  resolved: { label: "Résolu", variant: "success" },
};

export const MAINTENANCE_STATUS_OPTIONS: {
  value: MaintenanceStatus;
  label: string;
}[] = [
  { value: "open", label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolu" },
];
