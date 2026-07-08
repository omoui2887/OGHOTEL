import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { generateActivationCodeFormat } from "./activation-codes";
import type { ActivationCode, ActivationCodeStatus } from "./activation-codes";

/**
 * Fonctions de fetch et mutations pour les codes d'activation — SERVEUR UNIQUEMENT.
 */

export async function getActivationCodes(filters: {
  status?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{
  codes: ActivationCode[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { status, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("activation_codes").select(
    `
    id, code, lead_id, establishment_id, plan_id, payment_id, amount_fcfa,
    status, expires_at, used_at, created_by, created_at,
    plan:plans(name),
    lead:leads(full_name),
    establishment:establishments(name)
  `,
    { count: "exact" }
  );

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Erreur getActivationCodes:", error);
    return { codes: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const codes: ActivationCode[] = (data ?? []).map((c: any) => ({
    id: c.id,
    code: c.code,
    lead_id: c.lead_id,
    establishment_id: c.establishment_id,
    plan_id: c.plan_id,
    plan_name: c.plan?.name ?? null,
    payment_id: c.payment_id,
    amount_fcfa: c.amount_fcfa,
    status: c.status,
    expires_at: c.expires_at,
    used_at: c.used_at,
    created_by: c.created_by,
    created_at: c.created_at,
    lead_name: c.lead?.full_name ?? null,
    establishment_name: c.establishment?.name ?? null,
  }));

  return {
    codes,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

/**
 * Génère un code d'activation UNIQUEMENT si le paiement est validé.
 * Empêche la génération multiple pour le même paiement.
 *
 * Règles métier (PRD §8.2.6 + §14.1) :
 * - Le paiement doit avoir status = 'validated'
 * - Pas de code actif (generated/sent) existant pour ce paiement
 * - Le code est unique (constraint DB)
 * - Le code expire 30 jours après génération
 */
export async function generateActivationCode(input: {
  payment_id: string;
  created_by: string;
}): Promise<{
  success: boolean;
  code?: ActivationCode;
  error?: string;
}> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier que le paiement existe et est validé
  const { data: payment, error: payErr } = await supabase
    .from("subscription_payments")
    .select("id, status, plan_id, amount_fcfa, lead_id, establishment_id")
    .eq("id", input.payment_id)
    .single();

  if (payErr || !payment) {
    return { success: false, error: "Paiement introuvable" };
  }

  if (payment.status !== "validated") {
    return {
      success: false,
      error: "Le paiement doit être validé avant de générer un code",
    };
  }

  // 2. Vérifier qu'il n'y a pas déjà un code actif pour ce paiement
  const { data: existingCodes } = await supabase
    .from("activation_codes")
    .select("id, code, status")
    .eq("payment_id", input.payment_id)
    .in("status", ["generated", "sent"]);

  if (existingCodes && existingCodes.length > 0) {
    return {
      success: false,
      error: `Un code actif existe déjà pour ce paiement : ${existingCodes[0].code}`,
    };
  }

  // 3. Générer un code unique (retry si collision)
  let code = "";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    code = generateActivationCodeFormat();
    const { data: existing } = await supabase
      .from("activation_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (!existing) break;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { success: false, error: "Impossible de générer un code unique" };
  }

  // 4. Calculer la date d'expiration (30 jours)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // 5. Insérer le code
  const { data: newCode, error: insertErr } = await supabase
    .from("activation_codes")
    .insert({
      code,
      lead_id: payment.lead_id,
      establishment_id: payment.establishment_id,
      plan_id: payment.plan_id,
      payment_id: payment.id,
      amount_fcfa: payment.amount_fcfa,
      status: "generated",
      expires_at: expiresAt.toISOString(),
      created_by: input.created_by,
    })
    .select(
      `
      id, code, lead_id, establishment_id, plan_id, payment_id, amount_fcfa,
      status, expires_at, used_at, created_by, created_at,
      plan:plans(name),
      lead:leads(full_name),
      establishment:establishments(name)
    `
    )
    .single();

  if (insertErr || !newCode) {
    return { success: false, error: insertErr?.message ?? "Erreur d'insertion" };
  }

  // 6. Log l'activité
  await supabase.from("activity_logs").insert({
    establishment_id: null,
    user_id: input.created_by,
    action: "activation_code_generated",
    entity_type: "activation_code",
    entity_id: newCode.id,
    metadata: { code, payment_id: input.payment_id },
  });

  const c = newCode as any;
  const codeResult: ActivationCode = {
    id: c.id,
    code: c.code,
    lead_id: c.lead_id,
    establishment_id: c.establishment_id,
    plan_id: c.plan_id,
    plan_name: c.plan?.name ?? null,
    payment_id: c.payment_id,
    amount_fcfa: c.amount_fcfa,
    status: c.status,
    expires_at: c.expires_at,
    used_at: c.used_at,
    created_by: c.created_by,
    created_at: c.created_at,
    lead_name: c.lead?.full_name ?? null,
    establishment_name: c.establishment?.name ?? null,
  };

  return { success: true, code: codeResult };
}

/**
 * Met à jour le statut d'un code (marquer comme envoyé, annuler).
 */
export async function updateCodeStatus(
  codeId: string,
  newStatus: ActivationCodeStatus,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { data: current } = await supabase
    .from("activation_codes")
    .select("status, code")
    .eq("id", codeId)
    .single();

  if (!current) {
    return { success: false, error: "Code introuvable" };
  }

  const { error } = await supabase
    .from("activation_codes")
    .update({ status: newStatus })
    .eq("id", codeId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: null,
    user_id: userId,
    action: "activation_code_status_changed",
    entity_type: "activation_code",
    entity_id: codeId,
    metadata: {
      code: current.code,
      old_status: current.status,
      new_status: newStatus,
    },
  });

  return { success: true };
}

/**
 * Génère un code d'activation d'ESSAI (24h) sans paiement requis.
 * Permet au Super Admin de faire tester le SaaS à un prospect.
 *
 * Règles :
 * - Pas de payment_id requis
 * - Durée de validité : 24 heures (au lieu de 30 jours)
 * - Le plan doit être actif
 * - Le code est unique (retry si collision)
 */
export async function generateTrialCode(input: {
  plan_id: string;
  created_by: string;
}): Promise<{
  success: boolean;
  code?: ActivationCode;
  error?: string;
}> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier que le plan existe et est actif
  const { data: plan, error: planErr } = await supabase
    .from("plans")
    .select("id, name, price_fcfa, is_active")
    .eq("id", input.plan_id)
    .single();

  if (planErr || !plan) {
    return { success: false, error: "Formule introuvable" };
  }

  if (!plan.is_active) {
    return { success: false, error: "Cette formule n'est plus disponible" };
  }

  // 2. Générer un code unique
  let code = "";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    code = generateActivationCodeFormat();
    const { data: existing } = await supabase
      .from("activation_codes")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (!existing) break;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { success: false, error: "Impossible de générer un code unique" };
  }

  // 3. Calculer l'expiration (24h)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // 4. Insérer le code d'essai (sans payment_id, sans lead_id)
  const { data: newCode, error: insertErr } = await supabase
    .from("activation_codes")
    .insert({
      code,
      lead_id: null,
      establishment_id: null,
      plan_id: input.plan_id,
      payment_id: null,
      amount_fcfa: 0, // Essai gratuit
      status: "generated",
      expires_at: expiresAt.toISOString(),
      created_by: input.created_by,
    })
    .select(`
      id, code, lead_id, establishment_id, plan_id, payment_id, amount_fcfa,
      status, expires_at, used_at, created_by, created_at,
      plan:plans(name),
      lead:leads(full_name),
      establishment:establishments(name)
    `)
    .single();

  if (insertErr || !newCode) {
    return { success: false, error: insertErr?.message ?? "Erreur d'insertion" };
  }

  // 5. Log
  await supabase.from("activity_logs").insert({
    establishment_id: null,
    user_id: input.created_by,
    action: "trial_code_generated",
    entity_type: "activation_code",
    entity_id: newCode.id,
    metadata: { code, plan_name: plan.name, expires_at: expiresAt.toISOString() },
  });

  const c = newCode as any;
  const codeResult: ActivationCode = {
    id: c.id,
    code: c.code,
    lead_id: c.lead_id,
    establishment_id: c.establishment_id,
    plan_id: c.plan_id,
    plan_name: c.plan?.name ?? null,
    payment_id: c.payment_id,
    amount_fcfa: c.amount_fcfa,
    status: c.status,
    expires_at: c.expires_at,
    used_at: c.used_at,
    created_by: c.created_by,
    created_at: c.created_at,
    lead_name: c.lead?.full_name ?? null,
    establishment_name: c.establishment?.name ?? null,
  };

  return { success: true, code: codeResult };
}
