import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { activateAccount } from "@/lib/activation/server";

/**
 * POST /api/activation/register
 *
 * Active un compte client à partir d'un code vérifié.
 * Route PUBLIQUE (le prospect n'est pas encore authentifié).
 *
 * Opérations atomiques avec rollback manuel :
 * 1. Re-vérifier le code (sécurité)
 * 2. Créer user Supabase Auth
 * 3. Créer établissement
 * 4. Créer profil hotel_admin
 * 5. Marquer code comme used
 * 6. Log activité
 *
 * Body : RegisterInput (code, owner_name, establishment_name, ...)
 * Retourne : { success: boolean, error?: string }
 */

const schema = z.object({
  code: z.string().min(1, "Code requis").max(50),
  owner_name: z
    .string()
    .min(2, "Le nom du gérant doit contenir au moins 2 caractères")
    .max(100, "Nom trop long"),
  establishment_name: z
    .string()
    .min(2, "Le nom de l'établissement doit contenir au moins 2 caractères")
    .max(150, "Nom trop long"),
  establishment_type: z.enum(["hotel", "residence", "auberge", "other"], {
    error: "Type d'établissement invalide",
  }),
  city: z
    .string()
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(100),
  address: z.string().min(2, "L'adresse est requise").max(300),
  phone: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide")
    .max(150),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128)
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await activateAccount(parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès. Vous pouvez vous connecter.",
      establishment_id: result.establishment_id,
    });
  } catch (err) {
    console.error("Erreur /api/activation/register:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de l'activation" },
      { status: 500 }
    );
  }
}
