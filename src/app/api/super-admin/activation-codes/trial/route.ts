import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { generateTrialCode } from "@/lib/super-admin/activation-codes-server";

/**
 * POST /api/super-admin/activation-codes/trial
 *
 * Génère un code d'activation d'ESSAI (24h) sans paiement requis.
 * Permet au Super Admin de faire tester le SaaS à un prospect.
 *
 * 🔒 super_admin uniquement.
 */

const schema = z.object({
  plan_id: z.string().uuid("Formule requise"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "super_admin" || !profile.is_active) {
      return NextResponse.json(
        { error: "Accès refusé — super_admin requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await generateTrialCode({
      plan_id: parsed.data.plan_id,
      created_by: user.id,
    });

    if (!result.success || !result.code) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de générer le code d'essai" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      message: `Code d'essai généré : ${result.code.code} (valide 24h)`,
    });
  } catch (err) {
    console.error("Erreur POST /api/super-admin/activation-codes/trial:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
