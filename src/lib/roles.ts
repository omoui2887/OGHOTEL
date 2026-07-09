import type { UserRole } from "@/types";

/**
 * Gestion des rôles OGHOTEL — PRD §5.
 *
 * 7 rôles définis :
 * - super_admin    : éditeur de la plateforme (non rattaché à un établissement)
 * - hotel_admin    : propriétaire/gérant d'un établissement
 * - manager        : supervision opérationnelle
 * - receptionist   : réservations, clients, check-in/out, paiements
 * - accountant     : paiements, dépenses, rapports
 * - housekeeping    : suivi de l'état des chambres
 * - maintenance    : incidents et réparations
 */

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
  super_admin: "Éditeur de la plateforme OGHOTEL — gestion globale SaaS",
  hotel_admin: "Propriétaire ou gérant de l'établissement",
  manager: "Supervision opérationnelle de l'établissement",
  receptionist: "Réservations, clients, check-in/check-out, paiements",
  accountant: "Paiements, dépenses, rapports financiers",
  housekeeping: "Suivi de l'état et du nettoyage des chambres",
  maintenance: "Incidents et réparations",
};

/** Rôles SaaS — accès au /super-admin/*. */
export const SUPER_ADMIN_ROLES: UserRole[] = ["super_admin"];

/** Rôles établissement — accès au /app/*. */
export const HOTEL_STAFF_ROLES: UserRole[] = [
  "hotel_admin",
  "manager",
  "receptionist",
  "accountant",
  "housekeeping",
  "maintenance",
];

/** Tous les rôles. */
export const ALL_ROLES: UserRole[] = [...SUPER_ADMIN_ROLES, ...HOTEL_STAFF_ROLES];

/** Vérifie si le rôle est un Super Admin. */
export function isSuperAdmin(role: UserRole | undefined | null): role is "super_admin" {
  return role === "super_admin";
}

/** Vérifie si le rôle fait partie du personnel d'un établissement. */
export function isHotelUser(role: UserRole | undefined | null): boolean {
  return !!role && HOTEL_STAFF_ROLES.includes(role);
}

/** Vérifie si le rôle peut accéder au /super-admin/*. */
export function canAccessSuperAdmin(role: UserRole | undefined | null): boolean {
  return isSuperAdmin(role);
}

/** Vérifie si le rôle peut accéder au /app/*. */
export function canAccessApp(role: UserRole | undefined | null): boolean {
  return isHotelUser(role);
}

/**
 * Retourne le chemin de redirection par défaut selon le rôle.
 * - super_admin → /super-admin/dashboard
 * - hotel_admin et staff → /app/dashboard
 * - sinon → /login
 */
export function getRedirectPathForRole(role: UserRole | undefined | null): string {
  if (isSuperAdmin(role)) return "/super-admin/dashboard";
  if (isHotelUser(role)) return "/app/dashboard";
  return "/login";
}

/**
 * Vérifie si un rôle est autorisé pour une liste de rôles acceptés.
 */
export function hasRole(
  role: UserRole | undefined | null,
  allowed: UserRole | UserRole[]
): boolean {
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}

/**
 * Permissions par rôle — modules accessibles dans la sidebar /app/*.
 *
 * Règles métier (PRD §5) :
 * - receptionist : clients, réservations, check-in/out, paiements simples
 * - accountant   : paiements, dépenses, rapports
 * - housekeeping : ménage uniquement
 * - maintenance  : maintenance uniquement
 * - manager      : gestion opérationnelle avancée (tous sauf personnel/paramètres)
 * - hotel_admin  : accès complet établissement
 */
export const ROLE_NAV_PERMISSIONS: Record<string, string[]> = {
  hotel_admin: [
    "/app/dashboard",
    "/app/rooms",
    "/app/calendar",
    "/app/reservations",
    "/app/guests",
    "/app/payments",
    "/app/invoices",
    "/app/expenses",
    "/app/housekeeping",
    "/app/maintenance",
    "/app/reports",
    "/app/users",
    "/app/settings",
  ],
  manager: [
    "/app/dashboard",
    "/app/rooms",
    "/app/calendar",
    "/app/reservations",
    "/app/guests",
    "/app/payments",
    "/app/invoices",
    "/app/expenses",
    "/app/housekeeping",
    "/app/maintenance",
    "/app/reports",
  ],
  receptionist: [
    "/app/dashboard",
    "/app/calendar",
    "/app/reservations",
    "/app/guests",
    "/app/payments",
    "/app/invoices",
    "/app/check-in",
    "/app/check-out",
  ],
  accountant: [
    "/app/dashboard",
    "/app/payments",
    "/app/invoices",
    "/app/expenses",
    "/app/reports",
  ],
  housekeeping: [
    "/app/dashboard",
    "/app/housekeeping",
  ],
  maintenance: [
    "/app/dashboard",
    "/app/maintenance",
  ],
};

/**
 * Vérifie si un rôle peut accéder à un module (path) donné.
 */
export function canAccessModule(
  role: UserRole | undefined | null,
  modulePath: string
): boolean {
  if (!role) return false;
  if (role === "super_admin") return true; // super_admin n'est pas dans /app/*
  const allowed = ROLE_NAV_PERMISSIONS[role];
  if (!allowed) return false;
  // Un rôle peut accéder à un module si son path exact est listé,
  // ou si un path parent est listé (ex: /app/reservations/123 → /app/reservations).
  return allowed.some(
    (p) => modulePath === p || modulePath.startsWith(p + "/")
  );
}
