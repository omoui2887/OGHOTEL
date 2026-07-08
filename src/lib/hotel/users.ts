/**
 * Types et constantes pour la gestion du personnel.
 * Safe côté client.
 */

import type { UserRole } from "@/types";

export type StaffUser = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  establishment_id: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  hotel_admin: "Admin Hôtel",
  manager: "Manager",
  receptionist: "Réceptionniste",
  accountant: "Comptable",
  housekeeping: "Ménage",
  maintenance: "Maintenance",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: "Éditeur de la plateforme (non assigné à un établissement)",
  hotel_admin: "Accès complet à l'établissement",
  manager: "Supervision opérationnelle (sauf paramètres critiques)",
  receptionist: "Réservations, clients, check-in/out, paiements simples",
  accountant: "Paiements, dépenses, rapports",
  housekeeping: "Ménage uniquement",
  maintenance: "Maintenance uniquement",
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "manager", label: "Manager" },
  { value: "receptionist", label: "Réceptionniste" },
  { value: "accountant", label: "Comptable" },
  { value: "housekeeping", label: "Ménage" },
  { value: "maintenance", label: "Maintenance" },
];

export const PERMISSIONS_MATRIX: {
  module: string;
  roles: Record<UserRole, boolean>;
}[] = [
  { module: "Tableau de bord", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: true, housekeeping: true, maintenance: true } },
  { module: "Chambres", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: false, housekeeping: true, maintenance: true } },
  { module: "Réservations", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: false, housekeeping: false, maintenance: false } },
  { module: "Clients", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: false, housekeeping: false, maintenance: false } },
  { module: "Check-in / Check-out", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: false, housekeeping: false, maintenance: false } },
  { module: "Paiements", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: true, housekeeping: false, maintenance: false } },
  { module: "Factures & Reçus", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: true, accountant: true, housekeeping: false, maintenance: false } },
  { module: "Dépenses", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: false, accountant: true, housekeeping: false, maintenance: false } },
  { module: "Ménage", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: false, accountant: false, housekeeping: true, maintenance: false } },
  { module: "Maintenance", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: false, accountant: false, housekeeping: false, maintenance: true } },
  { module: "Rapports", roles: { super_admin: false, hotel_admin: true, manager: true, receptionist: false, accountant: true, housekeeping: false, maintenance: false } },
  { module: "Personnel", roles: { super_admin: false, hotel_admin: true, manager: false, receptionist: false, accountant: false, housekeeping: false, maintenance: false } },
  { module: "Paramètres", roles: { super_admin: false, hotel_admin: true, manager: false, receptionist: false, accountant: false, housekeeping: false, maintenance: false } },
];
