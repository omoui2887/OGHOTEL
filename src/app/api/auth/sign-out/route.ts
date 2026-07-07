import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/sign-out
 *
 * Déconnecte l'utilisateur courant en révoquant la session Supabase Auth.
 * Les cookies de session sont automatiquement nettoyés par le client SSR.
 *
 * Le client doit rediriger vers /login après un appel réussi.
 */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur inconnue";

    if (message.includes("Configuration Supabase manquante")) {
      // Pas de Supabase configuré — on considère que la déconnexion a réussi.
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
