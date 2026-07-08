import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { createPayment } from "@/lib/super-admin/payments-server";
import { z } from "zod";

/**
 * POST /api/super-admin/payments
 * Crée un nouveau paiement SaaS (statut initial: pending).
 * GET /api/super-admin/payments
 * Liste les paiements (pour usage futur).
 *
 * 🔒 super_admin uniquement.
 */

const createSchema = z.object({
  lead_id: z.string().uuid().nullable().optional(),
  establishment_id: z.string().uuid().nullable().optional(),
  plan_id: z.string().uuid("Formule requise"),
  amount_fcfa: z
    .number()
    .int("Le montant doit être un entier")
    .min(1, "Le montant doit être positif")
    .max(10000000, "Montant trop élevé"),
  payment_method: z.enum(
    ["orange", "mtn", "moov", "wave", "cash", "card", "transfer"],
    { error: "Moyen de paiement invalide" }
  ),
  transaction_reference: z.string().max(200).optional(),
  paid_at: z.string().optional(),
  note: z.string().max(2000).optional(),
});

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "super_admin" || !profile.is_active) {
    return { error: NextResponse.json({ error: "Accès refusé — super_admin requis" }, { status: 403 }) };
  }
  return { user };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    // Au moins un de lead_id ou establishment_id doit être fourni
    if (!parsed.data.lead_id && !parsed.data.establishment_id) {
      return NextResponse.json(
        { error: "Veuillez sélectionner un prospect ou un établissement" },
        { status: 400 }
      );
    }

    const result = await createPayment({
      ...parsed.data,
      created_by: auth.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de créer le paiement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Paiement enregistré (en attente de validation)",
    });
  } catch (err) {
    console.error("Erreur POST /api/super-admin/payments:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
