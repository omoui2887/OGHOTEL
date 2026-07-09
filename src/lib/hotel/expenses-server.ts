import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Expense } from "./expenses";

/**
 * CRUD des dépenses — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage par establishment_id.
 * 🔒 Permissions : hotel_admin, manager, accountant peuvent créer/modifier.
 *    Seul hotel_admin peut supprimer.
 */

export async function getExpenses(
  establishmentId: string,
  filters: {
    category?: string;
    date_from?: string;
    date_to?: string;
    min_amount?: number;
    max_amount?: number;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  expenses: Expense[];
  total: number;
  totalAmount: number;
  byCategory: { category: string; total: number; count: number }[];
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const {
    category,
    date_from,
    date_to,
    min_amount,
    max_amount,
    page = 1,
    pageSize = 20,
  } = filters;

  let query = supabase
    .from("expenses")
    .select(
      `
      id, establishment_id, category, amount, expense_date, payment_method,
      description, attachment_url, created_by, created_at, updated_at,
      creator:profiles(full_name)
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (date_from) {
    query = query.gte("expense_date", date_from);
  }

  if (date_to) {
    query = query.lte("expense_date", date_to);
  }

  if (min_amount !== undefined) {
    query = query.gte("amount", min_amount);
  }

  if (max_amount !== undefined) {
    query = query.lte("amount", max_amount);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("expense_date", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return {
      expenses: [],
      total: 0,
      totalAmount: 0,
      byCategory: [],
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const expenses: Expense[] = (data as any[]).map((e) => ({
    id: e.id,
    establishment_id: e.establishment_id,
    category: e.category,
    amount: e.amount,
    expense_date: e.expense_date,
    payment_method: e.payment_method,
    description: e.description,
    attachment_url: e.attachment_url,
    created_by: e.created_by,
    created_at: e.created_at,
    updated_at: e.updated_at,
    created_by_name: e.creator?.full_name ?? null,
  }));

  // Récupérer le total et les stats par catégorie (sur tous les filtres sauf pagination)
  let statsQuery = supabase
    .from("expenses")
    .select("amount, category")
    .eq("establishment_id", establishmentId);

  if (category && category !== "all") {
    statsQuery = statsQuery.eq("category", category);
  }
  if (date_from) {
    statsQuery = statsQuery.gte("expense_date", date_from);
  }
  if (date_to) {
    statsQuery = statsQuery.lte("expense_date", date_to);
  }
  if (min_amount !== undefined) {
    statsQuery = statsQuery.gte("amount", min_amount);
  }
  if (max_amount !== undefined) {
    statsQuery = statsQuery.lte("amount", max_amount);
  }

  const { data: statsData } = await statsQuery;

  const totalAmount = (statsData ?? []).reduce(
    (sum, e: any) => sum + (e.amount || 0),
    0
  );

  const categoryMap = new Map<string, { total: number; count: number }>();
  (statsData ?? []).forEach((e: any) => {
    const cat = e.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { total: 0, count: 0 });
    }
    const entry = categoryMap.get(cat)!;
    entry.total += e.amount || 0;
    entry.count += 1;
  });

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.total - a.total);

  return {
    expenses,
    total: count ?? 0,
    totalAmount,
    byCategory,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getMonthExpensesTotal(
  establishmentId: string
): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("establishment_id", establishmentId)
    .gte("expense_date", startOfMonth);

  if (error || !data) return 0;

  return data.reduce((sum, e: any) => sum + (e.amount || 0), 0);
}

export async function createExpense(
  establishmentId: string,
  userId: string,
  input: {
    category: string;
    amount: number;
    expense_date: string;
    payment_method?: string;
    description?: string;
    attachment_url?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      establishment_id: establishmentId,
      category: input.category,
      amount: input.amount,
      expense_date: input.expense_date,
      payment_method: input.payment_method || null,
      description: input.description?.trim() || null,
      attachment_url: input.attachment_url || null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[expenses] createExpense failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "expense_created",
    entity_type: "expense",
    entity_id: data.id,
    metadata: {
      amount: input.amount,
      category: input.category,
      expense_date: input.expense_date,
    },
  });

  return { success: true, id: data.id };
}

export async function updateExpense(
  id: string,
  establishmentId: string,
  userId: string,
  input: {
    category?: string;
    amount?: number;
    expense_date?: string;
    payment_method?: string;
    description?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.category !== undefined) updateData.category = input.category;
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.expense_date !== undefined) updateData.expense_date = input.expense_date;
  if (input.payment_method !== undefined) updateData.payment_method = input.payment_method || null;
  if (input.description !== undefined) updateData.description = input.description.trim() || null;

  const { error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[expenses] updateExpense failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "expense_updated",
    entity_type: "expense",
    entity_id: id,
  });

  return { success: true };
}

export async function deleteExpense(
  id: string,
  establishmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("establishment_id", establishmentId);

  if (error) {
    console.error("[expenses] deleteExpense failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "expense_deleted",
    entity_type: "expense",
    entity_id: id,
  });

  return { success: true };
}
