import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyActivationCode } from "@/lib/activation/server";

/**
 * POST /api/activation/verify
 *
 * Vérifie qu'un code d'activation est valide.
 * Route PUBLIQUE (le prospect n'est pas encore authentifié).
 *
 * Body : { code: string }
 * Retourne : { valid: boolean, code?: ActivationCodeInfo, error?: string }
 *
 * 🔒 Utilise le client admin (service_role) côté serveur uniquement.
 *    Ne retourne jamais d'informations sensibles (uniquement le nom du plan
 *    et le montant, qui seront affichés au prospect).
 */

const schema = z.object({
  code: z
    .string()
    .min(1, "Veuillez saisir un code")
    .max(50, "Code trop long"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { valid: false, error: firstError?.message ?? "Code invalide" },
        { status: 400 }
      );
    }

    const result = await verifyActivationCode(parsed.data.code);

    if (!result.valid) {
      return NextResponse.json({ valid: false, error: result.error });
    }

    // Retourner uniquement les infos nécessaires pour le formulaire /register
    return NextResponse.json({
      valid: true,
      code: {
        id: result.code.id,
        code: result.code.code,
        plan_name: result.code.plan_name,
        plan_price_fcfa: result.code.plan_price_fcfa,
        amount_fcfa: result.code.amount_fcfa,
        lead_name: result.code.lead_name,
      },
    });
  } catch (err) {
    console.error("Erreur /api/activation/verify:", err);
    return NextResponse.json(
      { valid: false, error: "Erreur serveur lors de la vérification" },
      { status: 500 }
    );
  }
}
