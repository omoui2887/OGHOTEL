import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * POST /api/auth/sign-in
 *
 * Connecte un utilisateur via Supabase Auth (email + mot de passe).
 * Les cookies de session sont automatiquement positionnés par le client
 * Supabase SSR côté serveur.
 *
 * Retourne l'utilisateur + le profil (rôle, establishment_id) pour
 * permettre au client de rediriger selon le rôle.
 *
 * ⚠️ Aucune clé service_role n'est utilisée ici — uniquement le client
 * serveur standard (NEXT_PUBLIC_* + cookies de session).
 */

const signInSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Tente de récupérer le profil pour déterminer la redirection.
    // Si la table `profiles` n'existe pas encore, profile = null.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name, establishment_id, is_active")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      // L'utilisateur est authentifié mais n'a pas de profil.
      // On le déconnecte pour éviter une session orpheline.
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "Votre compte n'a pas de profil associé. Contactez l'administrateur.",
        },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Votre compte est désactivé. Contactez l'administrateur." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
        establishment_id: profile.establishment_id,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue";

    if (message.includes("Configuration Supabase manquante")) {
      return NextResponse.json(
        {
          error:
            "Service d'authentification non configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion" },
      { status: 500 }
    );
  }
}
