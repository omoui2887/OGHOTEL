import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Paramètres établissement — SERVEUR UNIQUEMENT.
 * 🔒 Filtrage par establishment_id.
 */

export type EstablishmentSettings = {
  id: string;
  name: string;
  type: string;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  logo_url: string | null;
  plan_id: string | null;
  plan_name: string | null;
  plan_price: number | null;
  subscription_status: string;
  subscription_start: string | null;
  subscription_end: string | null;
  timezone: string;
  currency: string;
  // Champs personnalisés (stockés en JSON dans une colonne dédiée ou dans description)
  check_in_time: string;
  check_out_time: string;
  invoice_text: string;
  days_until_expiry: number | null;
};

export async function getEstablishmentSettings(
  establishmentId: string
): Promise<EstablishmentSettings | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("establishments")
    .select(
      `
      id, name, type, owner_name, email, phone, city, address, logo_url,
      plan_id, subscription_status, subscription_start, subscription_end,
      timezone, currency
    `
    )
    .eq("id", establishmentId)
    .single();

  if (error || !data) return null;

  // Récupérer le plan
  let planName: string | null = null;
  let planPrice: number | null = null;
  if (data.plan_id) {
    const { data: plan } = await supabase
      .from("plans")
      .select("name, price_fcfa")
      .eq("id", data.plan_id)
      .single();
    planName = plan?.name ?? null;
    planPrice = plan?.price_fcfa ?? null;
  }

  // Calculer jours restants
  let daysUntilExpiry: number | null = null;
  if (data.subscription_end) {
    const end = new Date(data.subscription_end);
    daysUntilExpiry = Math.ceil(
      (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Les champs check_in_time, check_out_time, invoice_text ne sont pas dans le schéma
  // On utilise des valeurs par défaut (pourraient être stockés dans une table settings)
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    owner_name: data.owner_name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    address: data.address,
    logo_url: data.logo_url,
    plan_id: data.plan_id,
    plan_name: planName,
    plan_price: planPrice,
    subscription_status: data.subscription_status,
    subscription_start: data.subscription_start,
    subscription_end: data.subscription_end,
    timezone: data.timezone || "Africa/Abidjan",
    currency: data.currency || "XOF",
    check_in_time: "14:00",
    check_out_time: "12:00",
    invoice_text: "",
    days_until_expiry: daysUntilExpiry,
  };
}

export async function updateEstablishmentSettings(
  establishmentId: string,
  userId: string,
  input: {
    name?: string;
    type?: string;
    owner_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    address?: string;
    logo_url?: string;
    timezone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.type !== undefined) updateData.type = input.type;
  if (input.owner_name !== undefined) updateData.owner_name = input.owner_name.trim() || null;
  if (input.email !== undefined) updateData.email = input.email.trim() || null;
  if (input.phone !== undefined) updateData.phone = input.phone.trim() || null;
  if (input.city !== undefined) updateData.city = input.city.trim() || null;
  if (input.address !== undefined) updateData.address = input.address.trim() || null;
  if (input.logo_url !== undefined) updateData.logo_url = input.logo_url || null;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;

  const { error } = await supabase
    .from("establishments")
    .update(updateData)
    .eq("id", establishmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "establishment_settings_updated",
    entity_type: "establishment",
    entity_id: establishmentId,
    metadata: { updated_fields: Object.keys(input) },
  });

  return { success: true };
}
