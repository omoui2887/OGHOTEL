/**
 * Types et constantes pour les dépenses.
 * Safe côté client.
 */

export type ExpenseCategory =
  | "salaire"
  | "electricite"
  | "eau"
  | "internet"
  | "maintenance"
  | "fournitures"
  | "carburant"
  | "nettoyage"
  | "autre";

export type Expense = {
  id: string;
  establishment_id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  description: string | null;
  attachment_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Infos jointes
  created_by_name?: string | null;
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salaire: "Salaires",
  electricite: "Électricité",
  eau: "Eau",
  internet: "Internet",
  maintenance: "Maintenance",
  fournitures: "Fournitures",
  carburant: "Carburant",
  nettoyage: "Nettoyage",
  autre: "Autre",
};

export const EXPENSE_CATEGORY_OPTIONS: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: "salaire", label: "Salaires", icon: "👥" },
  { value: "electricite", label: "Électricité", icon: "⚡" },
  { value: "eau", label: "Eau", icon: "💧" },
  { value: "internet", label: "Internet", icon: "📡" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "fournitures", label: "Fournitures", icon: "📦" },
  { value: "carburant", label: "Carburant", icon: "⛽" },
  { value: "nettoyage", label: "Nettoyage", icon: "🧹" },
  { value: "autre", label: "Autre", icon: "📋" },
];

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  orange: "Orange Money",
  mtn: "MTN Money",
  moov: "Moov Money",
  wave: "Wave",
  card: "Carte bancaire",
  transfer: "Virement",
};

export const PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: "cash", label: "Espèces" },
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Money" },
  { value: "moov", label: "Moov Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
  { value: "transfer", label: "Virement" },
];

/**
 * Génère un CSV à partir d'une liste de dépenses.
 */
export function expensesToCSV(expenses: Expense[]): string {
  const headers = [
    "Date",
    "Catégorie",
    "Description",
    "Montant (FCFA)",
    "Moyen de paiement",
    "Créé par",
  ];

  const rows = expenses.map((e) => [
    e.expense_date,
    EXPENSE_CATEGORY_LABELS[e.category] ?? e.category,
    (e.description ?? "").replace(/"/g, '""'),
    String(e.amount),
    PAYMENT_METHOD_LABELS[e.payment_method ?? ""] ?? e.payment_method ?? "",
    e.created_by_name ?? "",
  ]);

  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
  ].join("\n");

  // BOM pour Excel
  return "\uFEFF" + csv;
}
