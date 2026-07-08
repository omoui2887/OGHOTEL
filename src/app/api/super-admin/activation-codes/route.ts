import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { generateActivationCode } from "@/lib/super-admin/activation-codes-server";
import { z } from "zod";

/**
 * POST /api/super-admin/activation-codes
 * Génère un code d'activation pour un paiement validé.
 *
 * Body: { payment_id: string }
 *
 * 🔒 super_admin uniquement.
 * 🔒 Le paiement doit être validé.
 * 🔒 Empêche la génération multiple pour le même paiement.
 */

const generateSchema = z.object({
  payment_id: z.string().uuid("ID de paiement invalide"),
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
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await generateActivationCode({
      payment_id: parsed.data.payment_id,
      created_by: user.id,
    });

    if (!result.success || !result.code) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de générer le code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      message: `Code généré : ${result.code.code}`,
    });
  } catch (err) {
    console.error("Erreur POST /api/super-admin/activation-codes:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
