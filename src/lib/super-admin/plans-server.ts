import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Plan, PlanFeatures } from "./plans";

/**
 * Fonctions de fetch et update des plans tarifaires — SERVEUR UNIQUEMENT.
 *
 * 🔒 Toutes utilisent le client admin (service_role) qui bypass RLS.
 *    Le client admin ne sort JAMAIS du serveur.
 */

/**
 * Récupère tous les plans avec le nombre d'établissements qui les utilisent.
 */
export async function getPlans(): Promise<Plan[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("price_fcfa", { ascending: true });

  if (error || !data) {
    console.error("Erreur getPlans:", error);
    return [];
  }

  // Récupérer le nombre d'établissements par plan
  const { data: estCounts, error: estErr } = await supabase
    .from("establishments")
    .select("plan_id");

  const counts = new Map<string, number>();
  if (!estErr && estCounts) {
    estCounts.forEach((e: any) => {
      if (e.plan_id) {
        counts.set(e.plan_id, (counts.get(e.plan_id) || 0) + 1);
      }
    });
  }

  return (data as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    price_fcfa: p.price_fcfa,
    duration_days: p.duration_days,
    max_users: p.max_users,
    max_establishments: p.max_establishments,
    features: (p.features ?? {}) as PlanFeatures,
    description: p.description,
    is_active: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
    establishments_count: counts.get(p.id) || 0,
  }));
}

/**
 * Récupère un plan par son ID.
 */
export async function getPlanById(id: string): Promise<Plan | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const p = data as any;
  return {
    id: p.id,
    name: p.name,
    price_fcfa: p.price_fcfa,
    duration_days: p.duration_days,
    max_users: p.max_users,
    max_establishments: p.max_establishments,
    features: (p.features ?? {}) as PlanFeatures,
    description: p.description,
    is_active: p.is_active,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

/**
 * Met à jour un plan.
 */
export async function updatePlan(
  id: string,
  updates: {
    price_fcfa?: number;
    description?: string;
    is_active?: boolean;
    max_users?: number | null;
    max_establishments?: number | null;
    features?: PlanFeatures;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.price_fcfa !== undefined) {
    updateData.price_fcfa = updates.price_fcfa;
  }
  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }
  if (updates.is_active !== undefined) {
    updateData.is_active = updates.is_active;
  }
  if (updates.max_users !== undefined) {
    updateData.max_users = updates.max_users;
  }
  if (updates.max_establishments !== undefined) {
    updateData.max_establishments = updates.max_establishments;
  }
  if (updates.features !== undefined) {
    updateData.features = updates.features;
  }

  const { error } = await supabase
    .from("plans")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("[plans] updatePlan failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  return { success: true };
}

/**
 * Vérifie si un plan est utilisé par des établissements.
 * Empêche la désactivation ou suppression dangereuse.
 */
export async function isPlanInUse(id: string): Promise<{
  inUse: boolean;
  count: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("establishments")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", id);

  if (error) {
    return { inUse: false, count: 0 };
  }

  return {
    inUse: (count ?? 0) > 0,
    count: count ?? 0,
  };
}
