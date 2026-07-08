import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * POST /api/auth/sign-in
 *
 * Connecte un utilisateur via Supabase Auth.
 * Les cookies de session sont positionnés sur la réponse finale.
 *
 * ⚠️  La lecture du profil utilise le client admin (service_role) qui bypass RLS.
 *     Le client admin ne sort JAMAIS du serveur.
 */

const signInSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type CookieToSet = { name: string; value: string; options: Record<string, unknown> };

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Service d'authentification non configuré" },
        { status: 503 }
      );
    }

    // Collecter les cookies à set pendant l'authentification
    const cookiesToSet: CookieToSet[] = [];

    // Créer le client Supabase avec gestion des cookies
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookiesToSet.push({ name, value, options });
            request.cookies.set(name, value);
          });
        },
      },
    });

    // 1. Authentifier l'utilisateur
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      const errMsg = error?.message ?? "";
      if (
        errMsg.includes("Invalid login credentials") ||
        errMsg.includes("invalid")
      ) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 2. Récupérer le profil via le client ADMIN (bypass RLS)
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select(
        "id, role, full_name, establishment_id, is_active, must_change_password"
      )
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
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

    // 3. Créer la réponse finale avec les cookies + les données JSON
    const responseBody = {
      user: { id: data.user.id, email: data.user.email },
      profile: {
        id: profile.id,
        role: profile.role,
        full_name: profile.full_name,
        establishment_id: profile.establishment_id,
        must_change_password: profile.must_change_password,
      },
    };

    const response = NextResponse.json(responseBody);

    // Set tous les cookies collectés sur la réponse finale
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as Record<string, unknown> & { path?: string });
    });

    return response;
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

    console.error("Erreur /api/auth/sign-in:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la connexion" },
      { status: 500 }
    );
  }
}
