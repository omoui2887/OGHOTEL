/**
 * Types et constantes pour la gestion des plans tarifaires.
 *
 * Safe côté client (pas d'import serveur).
 */

export type PlanFeatures = {
  // Modules de base (tous les plans)
  chambres?: boolean;
  reservations?: boolean;
  clients?: boolean;
  paiements?: boolean;
  facturation?: boolean;
  rapports?: boolean;
  // Modules avancés
  rapports_avances?: boolean;
  depenses?: boolean | "limite";
  personnel?: boolean | "limite";
  menage?: boolean;
  maintenance?: boolean;
  export_csv?: boolean;
  export_pdf?: boolean;
  export_comptable?: boolean;
  multi_etablissement?: boolean;
  support_prioritaire?: boolean;
  assistance_dediee?: boolean;
};

export type Plan = {
  id: string;
  name: string;
  price_fcfa: number;
  duration_days: number;
  max_users: number | null;
  max_establishments: number | null;
  features: PlanFeatures;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Stats d'usage (pour empêcher la suppression dangereuse)
  establishments_count?: number;
};

/**
 * Liste des fonctionnalités avec leur libellé et description.
 * Utilisé pour l'interface de cases à cocher.
 */
export const FEATURE_DEFINITIONS: {
  key: keyof PlanFeatures;
  label: string;
  description: string;
  category: "base" | "avance" | "export" | "support";
}[] = [
  // Modules de base
  { key: "chambres", label: "Chambres & types de chambres", description: "Gestion des chambres, statuts, équipements", category: "base" },
  { key: "reservations", label: "Réservations", description: "Création, modification, check-in/check-out", category: "base" },
  { key: "clients", label: "Clients hébergés", description: "Fiches clients, historique, CRM basique", category: "base" },
  { key: "paiements", label: "Paiements séjour", description: "Encaissement, acomptes, soldes", category: "base" },
  { key: "facturation", label: "Factures & reçus", description: "Génération de factures et reçus imprimables", category: "base" },
  { key: "rapports", label: "Rapports de base", description: "Taux d'occupation, chiffre d'affaires", category: "base" },
  // Modules avancés
  { key: "rapports_avances", label: "Rapports avancés", description: "Analyses détaillées, prévisions, KPIs", category: "avance" },
  { key: "depenses", label: "Dépenses", description: "Suivi des dépenses par catégorie", category: "avance" },
  { key: "personnel", label: "Personnel & rôles", description: "Gestion des comptes employés", category: "avance" },
  { key: "menage", label: "Ménage", description: "Tâches de nettoyage, statuts chambres", category: "avance" },
  { key: "maintenance", label: "Maintenance", description: "Tickets d'incidents et réparations", category: "avance" },
  // Exports
  { key: "export_csv", label: "Export CSV", description: "Exportation des données en CSV", category: "export" },
  { key: "export_pdf", label: "Export PDF", description: "Génération de PDF (factures, rapports)", category: "export" },
  { key: "export_comptable", label: "Export comptable avancé", description: "Exports comptables pour le comptable", category: "export" },
  // Multi-établissement
  { key: "multi_etablissement", label: "Multi-établissements", description: "Gérer plusieurs établissements", category: "avance" },
  // Support
  { key: "support_prioritaire", label: "Support prioritaire", description: "Réponse prioritaire par WhatsApp", category: "support" },
  { key: "assistance_dediee", label: "Assistance dédiée", description: "Accompagnement personnalisé", category: "support" },
];

export const FEATURE_CATEGORIES: {
  value: "base" | "avance" | "export" | "support";
  label: string;
}[] = [
  { value: "base", label: "Modules de base" },
  { value: "avance", label: "Modules avancés" },
  { value: "export", label: "Exports" },
  { value: "support", label: "Support" },
];

export const PLAN_NAME_LABELS: Record<string, string> = {
  ESSENTIEL: "Essentiel",
  PRIVILEGE: "Privilège",
  PREMIUM: "Premium",
};
