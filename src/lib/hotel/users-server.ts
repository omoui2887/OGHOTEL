import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { StaffUser } from "./users";
import type { UserRole } from "@/types";

export async function getStaffUsers(establishmentId: string): Promise<StaffUser[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("establishment_id", establishmentId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const users: StaffUser[] = [];
  for (const p of data as any[]) {
    let email = "";
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(p.id);
      email = authUser?.user?.email ?? "";
    } catch {}
    users.push({
      id: p.id, full_name: p.full_name, email, phone: p.phone,
      role: p.role, establishment_id: p.establishment_id,
      must_change_password: p.must_change_password, is_active: p.is_active,
      created_at: p.created_at, updated_at: p.updated_at,
    });
  }
  return users;
}

export type PlanLimits = {
  max_users: number | null;
  current_users: number;
  can_create: boolean;
  remaining: number | null;
};

export async function getPlanLimits(establishmentId: string): Promise<PlanLimits> {
  const supabase = createSupabaseAdminClient();
  const { data: est } = await supabase
    .from("establishments")
    .select("plan:plans(max_users)")
    .eq("id", establishmentId)
    .single();

  const maxUsers = (est as any)?.plan?.max_users ?? null;
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("establishment_id", establishmentId);

  const currentUsers = count ?? 0;
  return {
    max_users: maxUsers,
    current_users: currentUsers,
    can_create: maxUsers === null || currentUsers < maxUsers,
    remaining: maxUsers === null ? null : Math.max(0, maxUsers - currentUsers),
  };
}

export async function createStaffUser(
  establishmentId: string,
  createdBy: string,
  input: { email: string; password: string; full_name: string; phone?: string; role: UserRole }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const limits = await getPlanLimits(establishmentId);
  if (!limits.can_create) {
    return { success: false, error: `Limite d'utilisateurs atteinte (${limits.max_users}/${limits.max_users}). Passez à une formule supérieure.` };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });

  if (authError) {
    if (authError.message.includes("already") || authError.message.includes("exists")) {
      return { success: false, error: "Un compte existe déjà avec cet email." };
    }
    return { success: false, error: "Impossible de créer le compte : " + authError.message };
  }

  if (!authData.user) return { success: false, error: "Impossible de créer le compte" };

  const userId = authData.user.id;
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: input.full_name.trim(),
    phone: input.phone?.trim() || null,
    role: input.role,
    establishment_id: establishmentId,
    must_change_password: true,
    is_active: true,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: "Impossible de créer le profil : " + profileError.message };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId, user_id: createdBy,
    action: "staff_user_created", entity_type: "profile", entity_id: userId,
    metadata: { email: input.email, full_name: input.full_name, role: input.role },
  });

  return { success: true, id: userId };
}

export async function updateStaffUser(
  userId: string, establishmentId: string, updatedBy: string,
  input: { role?: UserRole; is_active?: boolean; full_name?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("profiles").select("id, role, establishment_id")
    .eq("id", userId).eq("establishment_id", establishmentId).single();

  if (!existing) return { success: false, error: "Utilisateur introuvable" };
  if (userId === updatedBy && input.role !== undefined && input.role !== existing.role) {
    return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle" };
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.role !== undefined) updateData.role = input.role;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;
  if (input.full_name !== undefined) updateData.full_name = input.full_name.trim();
  if (input.phone !== undefined) updateData.phone = input.phone.trim() || null;

  const { error } = await supabase.from("profiles")
    .update(updateData).eq("id", userId).eq("establishment_id", establishmentId);

  if (error) return { success: false, error: error.message };

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId, user_id: updatedBy,
    action: "staff_user_updated", entity_type: "profile", entity_id: userId,
    metadata: { updated_fields: Object.keys(input) },
  });

  return { success: true };
}

export async function resetStaffPassword(
  userId: string, establishmentId: string, resetBy: string, newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("profiles").select("id").eq("id", userId).eq("establishment_id", establishmentId).single();
  if (!existing) return { success: false, error: "Utilisateur introuvable" };

  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { success: false, error: "Impossible de réinitialiser : " + error.message };

  await supabase.from("profiles")
    .update({ must_change_password: true, updated_at: new Date().toISOString() }).eq("id", userId);

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId, user_id: resetBy,
    action: "staff_password_reset", entity_type: "profile", entity_id: userId,
  });

  return { success: true };
}

export async function deleteStaffUser(
  userId: string, establishmentId: string, deletedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  if (userId === deletedBy) return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte" };

  const { data: existing } = await supabase
    .from("profiles").select("id").eq("id", userId).eq("establishment_id", establishmentId).single();
  if (!existing) return { success: false, error: "Utilisateur introuvable" };

  await supabase.from("profiles").delete().eq("id", userId).eq("establishment_id", establishmentId);
  await supabase.auth.admin.deleteUser(userId);

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId, user_id: deletedBy,
    action: "staff_user_deleted", entity_type: "profile", entity_id: userId,
  });

  return { success: true };
}
