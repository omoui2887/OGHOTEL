import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { SaaSPayment, PaymentStatus } from "./payments";

/**
 * Fonctions de fetch et mutations pour les paiements SaaS — SERVEUR UNIQUEMENT.
 */

export async function getPayments(filters: {
  status?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<{
  payments: SaaSPayment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { status, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("subscription_payments").select(
    `
    id, lead_id, establishment_id, plan_id, amount_fcfa, payment_method,
    transaction_reference, status, paid_at, validated_by, note,
    created_at, updated_at,
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
    console.error("Erreur getPayments:", error);
    return { payments: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const payments: SaaSPayment[] = (data ?? []).map((p: any) => ({
    id: p.id,
    lead_id: p.lead_id,
    establishment_id: p.establishment_id,
    plan_id: p.plan_id,
    plan_name: p.plan?.name ?? null,
    amount_fcfa: p.amount_fcfa,
    payment_method: p.payment_method,
    transaction_reference: p.transaction_reference,
    status: p.status,
    paid_at: p.paid_at,
    validated_by: p.validated_by,
    note: p.note,
    created_at: p.created_at,
    updated_at: p.updated_at,
    lead_name: p.lead?.full_name ?? null,
    establishment_name: p.establishment?.name ?? null,
  }));

  return {
    payments,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getPaymentById(id: string): Promise<SaaSPayment | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("subscription_payments")
    .select(
      `
      id, lead_id, establishment_id, plan_id, amount_fcfa, payment_method,
      transaction_reference, status, paid_at, validated_by, note,
      created_at, updated_at,
      plan:plans(name),
      lead:leads(full_name),
      establishment:establishments(name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const p = data as any;
  return {
    id: p.id,
    lead_id: p.lead_id,
    establishment_id: p.establishment_id,
    plan_id: p.plan_id,
    plan_name: p.plan?.name ?? null,
    amount_fcfa: p.amount_fcfa,
    payment_method: p.payment_method,
    transaction_reference: p.transaction_reference,
    status: p.status,
    paid_at: p.paid_at,
    validated_by: p.validated_by,
    note: p.note,
    created_at: p.created_at,
    updated_at: p.updated_at,
    lead_name: p.lead?.full_name ?? null,
    establishment_name: p.establishment?.name ?? null,
  };
}

export async function createPayment(input: {
  lead_id?: string | null;
  establishment_id?: string | null;
  plan_id: string;
  amount_fcfa: number;
  payment_method: string;
  transaction_reference?: string;
  paid_at?: string;
  note?: string;
  created_by: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("subscription_payments")
    .insert({
      lead_id: input.lead_id ?? null,
      establishment_id: input.establishment_id ?? null,
      plan_id: input.plan_id,
      amount_fcfa: input.amount_fcfa,
      payment_method: input.payment_method,
      transaction_reference: input.transaction_reference ?? null,
      status: "pending",
      paid_at: input.paid_at ?? new Date().toISOString(),
      note: input.note ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: null,
    user_id: input.created_by,
    action: "saas_payment_created",
    entity_type: "subscription_payment",
    entity_id: data.id,
    metadata: {
      amount_fcfa: input.amount_fcfa,
      payment_method: input.payment_method,
      plan_id: input.plan_id,
    },
  });

  return { success: true, id: data.id };
}

export async function updatePaymentStatus(
  paymentId: string,
  newStatus: PaymentStatus,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // Récupérer l'ancien statut
  const { data: current } = await supabase
    .from("subscription_payments")
    .select("status")
    .eq("id", paymentId)
    .single();

  if (!current) {
    return { success: false, error: "Paiement introuvable" };
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "validated") {
    updateData.validated_by = userId;
    if (!current.paid_at) {
      updateData.paid_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("subscription_payments")
    .update(updateData)
    .eq("id", paymentId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: null,
    user_id: userId,
    action: "saas_payment_status_changed",
    entity_type: "subscription_payment",
    entity_id: paymentId,
    metadata: { old_status: current.status, new_status: newStatus },
  });

  return { success: true };
}
