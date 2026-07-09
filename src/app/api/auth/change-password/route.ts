import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * POST /api/auth/change-password
 *
 * Change le mot de passe de l'utilisateur connecté.
 *
 * Cas d'usage principal : le flag `must_change_password` est à true lors de
 * la première connexion (PRD §8.2.1 + §20.7). L'utilisateur est redirigé vers
 * /change-password et doit définir un nouveau mot de passe avant d'accéder
 * à son dashboard.
 *
 * Une fois le mot de passe changé avec succès, on met également à jour
 * `profiles.must_change_password = false` pour débloquer l'accès.
 *
 * ⚠️  Aucune clé service_role n'est utilisée ici : on utilise le client
 * serveur standard qui s'appuie sur la session cookie de l'utilisateur.
 * L'utilisateur ne peut donc changer QUE son propre mot de passe.
 */

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit faire au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const supabase = await createSupabaseServerClient();

    // 1. Vérifier que l'utilisateur est bien connecté
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour changer votre mot de passe" },
        { status: 401 }
      );
    }

    // 2. Vérifier le mot de passe actuel en réessayant de se connecter
    //    (sécurité : empêche un attaquant ayant volé une session de changer
    //     le mot de passe sans connaître l'ancien).
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Le mot de passe actuel est incorrect" },
        { status: 400 }
      );
    }

    // 3. Mettre à jour le mot de passe côté Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("[change-password] updateUser failed:", updateError.message);
      return NextResponse.json(
        { error: "Une erreur est survenue. Réessayez ou contactez le support." },
        { status: 400 }
      );
    }

    // 4. Mettre à jour le flag must_change_password dans profiles
    //    (table gérée par RLS — l'utilisateur peut updater sa propre ligne).
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: false, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (profileError) {
      // Le mot de passe a été changé côté Auth, mais on n'a pas pu mettre à
      // jour le flag. On log l'erreur mais on ne bloque pas l'utilisateur —
      // il devra peut-être rechanger son mot de passe à la prochaine connexion.
      console.error(
        "[change-password] Erreur mise à jour must_change_password :",
        profileError
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue";

    if (message.includes("Configuration Supabase manquante")) {
      return NextResponse.json(
        { error: "Service d'authentification non configuré" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
