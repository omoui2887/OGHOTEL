import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Vérification et activation des codes d'activation.
 *
 * 🔒 Toutes les opérations utilisent le client admin (service_role).
 *    Le client admin ne sort JAMAIS du serveur.
 */

export type ActivationCodeInfo = {
  id: string;
  code: string;
  plan_id: string;
  plan_name: string;
  plan_price_fcfa: number;
  amount_fcfa: number;
  status: string;
  expires_at: string;
  lead_id: string | null;
  lead_name: string | null;
};

export type VerifyResult =
  | { valid: true; code: ActivationCodeInfo }
  | { valid: false; error: string };

export async function verifyActivationCode(
  codeInput: string
): Promise<VerifyResult> {
  const supabase = createSupabaseAdminClient();
  const code = codeInput.trim().toUpperCase();

  if (!code) {
    return { valid: false, error: "Veuillez saisir un code d'activation" };
  }

  const { data, error } = await supabase
    .from("activation_codes")
    .select(
      `
      id, code, plan_id, amount_fcfa, status, expires_at, lead_id,
      plan:plans(name, price_fcfa, is_active),
      lead:leads(full_name)
    `
    )
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Erreur verifyActivationCode:", error);
    return { valid: false, error: "Erreur lors de la vérification" };
  }

  if (!data) {
    return { valid: false, error: "Code d'activation introuvable" };
  }

  const c = data as any;

  if (c.status === "used") {
    return {
      valid: false,
      error: "Ce code a déjà été utilisé. Contactez le Super Admin si besoin.",
    };
  }

  if (c.status === "cancelled") {
    return {
      valid: false,
      error: "Ce code a été annulé. Contactez le Super Admin.",
    };
  }

  if (c.status === "expired") {
    return {
      valid: false,
      error: "Ce code a expiré. Contactez le Super Admin pour en obtenir un nouveau.",
    };
  }

  if (c.status !== "generated" && c.status !== "sent") {
    return { valid: false, error: "Ce code n'est pas utilisable actuellement." };
  }

  const expiresAt = new Date(c.expires_at);
  if (expiresAt < new Date()) {
    await supabase
      .from("activation_codes")
      .update({ status: "expired" })
      .eq("id", c.id);
    return {
      valid: false,
      error: "Ce code a expiré. Contactez le Super Admin pour en obtenir un nouveau.",
    };
  }

  if (!c.plan || !c.plan.is_active) {
    return {
      valid: false,
      error: "La formule associée à ce code n'est plus disponible. Contactez le Super Admin.",
    };
  }

  return {
    valid: true,
    code: {
      id: c.id,
      code: c.code,
      plan_id: c.plan_id,
      plan_name: c.plan.name,
      plan_price_fcfa: c.plan.price_fcfa,
      amount_fcfa: c.amount_fcfa,
      status: c.status,
      expires_at: c.expires_at,
      lead_id: c.lead_id,
      lead_name: c.lead?.full_name ?? null,
    },
  };
}

export type RegisterInput = {
  code: string;
  owner_name: string;
  establishment_name: string;
  establishment_type: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  password: string;
};

export type ActivateResult =
  | { success: true; establishment_id: string; user_id: string }
  | { success: false; error: string };

export async function activateAccount(
  input: RegisterInput
): Promise<ActivateResult> {
  const supabase = createSupabaseAdminClient();

  const verify = await verifyActivationCode(input.code);
  if (!verify.valid) {
    return { success: false, error: verify.error };
  }

  const codeInfo = verify.code;

  // Vérifier email non utilisé : on tente de lister les users avec cet email
  // (getUserByEmail n'est pas dispo sur tous les clients — on utilise listUsers
  //  avec filtre, ou on catche l'erreur de createUser si doublon)
  // Approche simple : on tente createUser et on gère l'erreur 422 (email exists)

  // Créer user Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: input.email.toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.owner_name },
  });

  if (authError) {
    // Erreur 422 = user already exists
    if (authError.message.includes("already") || authError.message.includes("exists")) {
      return {
        success: false,
        error: "Un compte existe déjà avec cet email. Connectez-vous ou utilisez un autre email.",
      };
    }
    return {
      success: false,
      error: "Impossible de créer le compte : " + authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: "Impossible de créer le compte utilisateur",
    };
  }

  const userId = authData.user.id;

  // Créer établissement
  const subscriptionStart = new Date();
  const subscriptionEnd = new Date();
  subscriptionEnd.setDate(subscriptionEnd.getDate() + 365);

  const { data: estData, error: estError } = await supabase
    .from("establishments")
    .insert({
      name: input.establishment_name,
      type: input.establishment_type,
      owner_name: input.owner_name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      city: input.city,
      address: input.address,
      plan_id: codeInfo.plan_id,
      subscription_status: "active",
      subscription_start: subscriptionStart.toISOString().split("T")[0],
      subscription_end: subscriptionEnd.toISOString().split("T")[0],
      timezone: "Africa/Abidjan",
      currency: "XOF",
    })
    .select("id")
    .single();

  if (estError || !estData) {
    await supabase.auth.admin.deleteUser(userId);
    return {
      success: false,
      error: "Impossible de créer l'établissement : " + (estError?.message ?? "erreur"),
    };
  }

  const establishmentId = estData.id;

  // Créer profil hotel_admin
  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    full_name: input.owner_name,
    phone: input.phone,
    role: "hotel_admin",
    establishment_id: establishmentId,
    must_change_password: false,
    is_active: true,
  });

  if (profileError) {
    await supabase.from("establishments").delete().eq("id", establishmentId);
    await supabase.auth.admin.deleteUser(userId);
    return {
      success: false,
      error: "Impossible de créer le profil : " + profileError.message,
    };
  }

  // Marquer code comme used
  const { error: codeUpdateError } = await supabase
    .from("activation_codes")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      establishment_id: establishmentId,
    })
    .eq("id", codeInfo.id);

  if (codeUpdateError) {
    console.error("Erreur mise à jour code:", codeUpdateError);
  }

  // Log activité
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "account_activated",
    entity_type: "activation_code",
    entity_id: codeInfo.id,
    metadata: {
      code: codeInfo.code,
      plan_name: codeInfo.plan_name,
      establishment_name: input.establishment_name,
    },
  });

  return {
    success: true,
    establishment_id: establishmentId,
    user_id: userId,
  };
}
