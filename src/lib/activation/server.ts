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
    console.error("[activation] createUser failed:", authError.message);
    // Erreur 422 = user already exists
    if (authError.message.includes("already") || authError.message.includes("exists")) {
      return {
        success: false,
        error: "Un compte existe déjà avec cet email. Connectez-vous ou utilisez un autre email.",
      };
    }
    return {
      success: false,
      error: "Impossible de créer le compte. Réessayez ou contactez le support.",
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
  // Durée d'abonnement : 365 jours pour un code normal, 1 jour pour un code
  // d'essai (trial). Un code est considéré "trial" si son montant est 0 FCFA
  // (généré via /api/super-admin/activation-codes/trial qui pose expires_at = +24h).
  const isTrial = (codeInfo.amount_fcfa ?? 0) === 0;
  const subscriptionStart = new Date();
  const subscriptionEnd = new Date();
  subscriptionEnd.setDate(
    subscriptionEnd.getDate() + (isTrial ? 1 : 365)
  );

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
      subscription_status: isTrial ? "trial" : "active",
      subscription_start: subscriptionStart.toISOString().split("T")[0],
      subscription_end: subscriptionEnd.toISOString().split("T")[0],
      timezone: "Africa/Abidjan",
      currency: "XOF",
    })
    .select("id")
    .single();

  if (estError || !estData) {
    console.error("[activation] createEstablishment failed:", estError?.message);
    await supabase.auth.admin.deleteUser(userId);
    return {
      success: false,
      error: "Impossible de créer l'établissement. Réessayez ou contactez le support.",
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
    console.error("[activation] createProfile failed:", profileError.message);
    return {
      success: false,
      error: "Impossible de créer le profil utilisateur. Réessayez ou contactez le support.",
    };
  }

  // Marquer le code comme "used" de manière ATOMIQUE et CONDITIONNELLE.
  // On ne met à jour QUE si le statut est encore "generated" ou "sent".
  // Cela empêche la race condition où 2 prospects activent le même code
  // simultanément (les 2 passeraient verifyActivationCode, puis les 2
  // réussiraient un update inconditionnel).
  const { data: updatedCode, count: updatedCount } = await supabase
    .from("activation_codes")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      establishment_id: establishmentId,
    })
    .eq("id", codeInfo.id)
    .in("status", ["generated", "sent"])
    .select("id");

  // Si 0 ligne mise à jour → le code a été utilisé par quelqu'un d'autre
  // entre verifyActivationCode et maintenant. On doit annuler (rollback)
  // tout ce qu'on vient de créer.
  if (!updatedCode || updatedCode.length === 0) {
    console.warn(
      "[activation] Code déjà utilisé par une autre session, rollback. Code:",
      codeInfo.code
    );
    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.from("establishments").delete().eq("id", establishmentId);
    await supabase.auth.admin.deleteUser(userId);
    return {
      success: false,
      error:
        "Ce code d'activation vient d'être utilisé par une autre session. " +
        "Si vous pensez qu'il s'agit d'une erreur, contactez le support.",
    };
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
