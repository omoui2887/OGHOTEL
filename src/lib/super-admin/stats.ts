import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Fonctions de fetch des statistiques Super Admin.
 *
 * 🔒 Toutes utilisent le client admin (service_role) qui bypass RLS.
 *    Le super_admin doit voir toutes les données globales (PRD §8.2.2).
 *    Le client admin ne sort JAMAIS du serveur.
 */

export type SuperAdminStats = {
  leads: {
    total: number;
    new: number;
    contacted: number;
    negotiating: number;
    won: number;
    lost: number;
  };
  establishments: {
    total: number;
    active: number;
    expiring: number;
    expired: number;
    suspended: number;
  };
  payments: {
    monthRevenue: number;
    yearRevenue: number;
    totalRevenue: number;
    byMethod: { method: string; total: number }[];
  };
  codes: {
    total: number;
    generated: number;
    sent: number;
    used: number;
    expired: number;
    cancelled: number;
  };
  expiringSoon: {
    id: string;
    name: string;
    owner_name: string | null;
    subscription_end: string | null;
    plan_name: string | null;
  }[];
};

export type RecentLead = {
  id: string;
  full_name: string;
  business_name: string;
  business_type: string;
  city: string | null;
  phone: string;
  email: string | null;
  status: string;
  desired_plan_name: string | null;
  created_at: string;
};

export type RevenueByMonth = {
  month: string;
  revenue: number;
};

export type ClientsByPlan = {
  plan_name: string;
  clients: number;
};

/**
 * Récupère toutes les statistiques du dashboard Super Admin.
 * Gère les erreurs individuellement pour ne pas planter toute la page.
 */
export async function getSuperAdminStats(): Promise<SuperAdminStats> {
  const supabase = createSupabaseAdminClient();

  // --- LEADS ---
  const { data: leadsData } = await supabase.from("leads").select("status");
  const leads = leadsData ?? [];
  const leadsByStatus = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    negotiating: leads.filter((l) => l.status === "negotiating").length,
    won: leads.filter((l) => l.status === "won").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  // --- ESTABLISHMENTS ---
  const { data: estData } = await supabase
    .from("establishments")
    .select("subscription_status");
  const establishments = estData ?? [];
  const estByStatus = {
    total: establishments.length,
    active: establishments.filter((e) => e.subscription_status === "active").length,
    expiring: establishments.filter((e) => e.subscription_status === "expiring").length,
    expired: establishments.filter((e) => e.subscription_status === "expired").length,
    suspended: establishments.filter((e) => e.subscription_status === "suspended").length,
  };

  // --- PAYMENTS ---
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

  const { data: paymentsData } = await supabase
    .from("subscription_payments")
    .select("amount_fcfa, payment_method, status, paid_at")
    .eq("status", "validated");

  const allPayments = paymentsData ?? [];
  const monthRevenue = allPayments
    .filter((p) => p.paid_at && p.paid_at >= startOfMonth)
    .reduce((sum, p) => sum + (p.amount_fcfa || 0), 0);
  const yearRevenue = allPayments
    .filter((p) => p.paid_at && p.paid_at >= startOfYear)
    .reduce((sum, p) => sum + (p.amount_fcfa || 0), 0);
  const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount_fcfa || 0), 0);

  // Revenus par moyen de paiement
  const methodMap = new Map<string, number>();
  allPayments.forEach((p) => {
    const m = p.payment_method || "autre";
    methodMap.set(m, (methodMap.get(m) || 0) + (p.amount_fcfa || 0));
  });
  const byMethod = Array.from(methodMap.entries())
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total);

  // --- CODES ---
  const { data: codesData } = await supabase.from("activation_codes").select("status");
  const codes = codesData ?? [];
  const codesByStatus = {
    total: codes.length,
    generated: codes.filter((c) => c.status === "generated").length,
    sent: codes.filter((c) => c.status === "sent").length,
    used: codes.filter((c) => c.status === "used").length,
    expired: codes.filter((c) => c.status === "expired").length,
    cancelled: codes.filter((c) => c.status === "cancelled").length,
  };

  // --- EXPIRING SOON (abonnements expirant dans les 30 prochains jours) ---
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: expiringData } = await supabase
    .from("establishments")
    .select(`
      id, name, owner_name, subscription_end,
      plan:plans(name)
    `)
    .not("subscription_end", "is", null)
    .lte("subscription_end", in30Days)
    .order("subscription_end", { ascending: true })
    .limit(5);

  const expiringSoon = (expiringData ?? []).map((e: any) => ({
    id: e.id,
    name: e.name,
    owner_name: e.owner_name,
    subscription_end: e.subscription_end,
    plan_name: e.plan?.name ?? null,
  }));

  return {
    leads: leadsByStatus,
    establishments: estByStatus,
    payments: { monthRevenue, yearRevenue, totalRevenue, byMethod },
    codes: codesByStatus,
    expiringSoon,
  };
}

/**
 * Récupère les dernières demandes prospects (leads) triées par date.
 */
export async function getRecentLeads(limit = 5): Promise<RecentLead[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      id, full_name, business_name, business_type, city, phone, email, status, created_at,
      desired_plan:plans(name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((l: any) => ({
    id: l.id,
    full_name: l.full_name,
    business_name: l.business_name,
    business_type: l.business_type,
    city: l.city,
    phone: l.phone,
    email: l.email,
    status: l.status,
    desired_plan_name: l.desired_plan?.name ?? null,
    created_at: l.created_at,
  }));
}

/**
 * Récupère les revenus des 12 derniers mois pour le graphique.
 */
export async function getRevenueByMonth(): Promise<RevenueByMonth[]> {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const months: RevenueByMonth[] = [];

  // Générer les 12 derniers mois
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    const { data } = await supabase
      .from("subscription_payments")
      .select("amount_fcfa")
      .eq("status", "validated")
      .gte("paid_at", monthStart)
      .lt("paid_at", monthEnd);

    const revenue = (data ?? []).reduce((sum, p) => sum + (p.amount_fcfa || 0), 0);
    const monthLabel = d.toLocaleDateString("fr-FR", { month: "short" });
    months.push({ month: monthLabel, revenue });
  }

  return months;
}

/**
 * Récupère le nombre de clients par formule pour le graphique.
 */
export async function getClientsByPlan(): Promise<ClientsByPlan[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("establishments")
    .select(`
      plan:plans(name)
    `);

  if (error || !data) return [];

  const planMap = new Map<string, number>();
  data.forEach((e: any) => {
    const name = e.plan?.name ?? "Sans formule";
    planMap.set(name, (planMap.get(name) || 0) + 1);
  });

  return Array.from(planMap.entries())
    .map(([plan_name, clients]) => ({ plan_name, clients }))
    .sort((a, b) => b.clients - a.clients);
}
