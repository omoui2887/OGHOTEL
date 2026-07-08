import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Lead,
  LeadFilters,
  LeadsResult,
  LeadActivity,
} from "./leads";

/**
 * Fonctions de fetch des prospects (leads) — SERVEUR UNIQUEMENT.
 *
 * 🔒 Toutes utilisent le client admin (service_role) qui bypass RLS.
 *    Le client admin ne sort JAMAIS du serveur.
 *
 * ⚠️ Ce fichier ne doit JAMAIS être importé par un composant client.
 *    Utilisez `import "server-only"` pour empêcher l'import côté client.
 */

/**
 * Récupère la liste paginée des prospects avec filtres.
 */
export async function getLeads(filters: LeadFilters = {}): Promise<LeadsResult> {
  const supabase = createSupabaseAdminClient();
  const {
    search,
    status,
    city,
    plan_id,
    date_from,
    date_to,
    page = 1,
    pageSize = 10,
  } = filters;

  let query = supabase.from("leads").select(
    `
      id, full_name, business_name, business_type, city, rooms_count, phone, email,
      desired_plan_id, message, status, internal_notes, created_at, updated_at,
      desired_plan:plans(name)
    `,
    { count: "exact" }
  );

  if (search && search.trim()) {
    const s = search.trim();
    query = query.or(
      `full_name.ilike.%${s}%,business_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`
    );
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (city && city !== "all" && city.trim()) {
    query = query.ilike("city", `%${city.trim()}%`);
  }

  if (plan_id && plan_id !== "all") {
    query = query.eq("desired_plan_id", plan_id);
  }

  if (date_from) {
    query = query.gte("created_at", date_from);
  }
  if (date_to) {
    query = query.lte("created_at", date_to + "T23:59:59.999Z");
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur getLeads:", error);
    return { leads: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const leads: Lead[] = (data ?? []).map((l: any) => ({
    id: l.id,
    full_name: l.full_name,
    business_name: l.business_name,
    business_type: l.business_type,
    city: l.city,
    rooms_count: l.rooms_count,
    phone: l.phone,
    email: l.email,
    desired_plan_id: l.desired_plan_id,
    desired_plan_name: l.desired_plan?.name ?? null,
    message: l.message,
    status: l.status,
    internal_notes: l.internal_notes,
    created_at: l.created_at,
    updated_at: l.updated_at,
  }));

  return {
    leads,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Récupère un prospect par son ID avec détails complets.
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select(
      `
      id, full_name, business_name, business_type, city, rooms_count, phone, email,
      desired_plan_id, message, status, internal_notes, created_at, updated_at,
      desired_plan:plans(name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const l = data as any;
  return {
    id: l.id,
    full_name: l.full_name,
    business_name: l.business_name,
    business_type: l.business_type,
    city: l.city,
    rooms_count: l.rooms_count,
    phone: l.phone,
    email: l.email,
    desired_plan_id: l.desired_plan_id,
    desired_plan_name: l.desired_plan?.name ?? null,
    message: l.message,
    status: l.status,
    internal_notes: l.internal_notes,
    created_at: l.created_at,
    updated_at: l.updated_at,
  };
}

/**
 * Récupère l'historique d'activité d'un lead.
 */
export async function getLeadActivity(leadId: string): Promise<LeadActivity[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      `
      id, action, metadata, created_at,
      user:profiles(email, full_name)
    `
    )
    .eq("entity_type", "lead")
    .eq("entity_id", leadId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((log: any) => ({
    id: log.id,
    action: log.action,
    metadata: log.metadata ?? {},
    created_at: log.created_at,
    user_email: log.user?.email ?? null,
  }));
}

/**
 * Récupère la liste des villes distinctes (pour le filtre).
 */
export async function getDistinctCities(): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("city")
    .not("city", "is", null)
    .order("city", { ascending: true });

  if (error || !data) return [];
  const cities = Array.from(
    new Set(data.map((d: any) => d.city).filter(Boolean))
  ) as string[];
  return cities.sort();
}

/**
 * Récupère la liste des formules (pour le filtre).
 */
export async function getPlansForFilter() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("plans")
    .select("id, name")
    .eq("is_active", true)
    .order("price_fcfa", { ascending: true });

  if (error || !data) return [];
  return data as { id: string; name: string }[];
}
