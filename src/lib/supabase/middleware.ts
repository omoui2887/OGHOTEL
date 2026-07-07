import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware Supabase — PRD §12.4.
 *
 * Responsabilités :
 * 1. Rafraîchir la session Auth sur chaque requête (cookies).
 * 2. Protéger les routes /super-admin/* et /app/* : si l'utilisateur
 *    n'est pas connecté, rediriger vers /login?redirect=<path>.
 *
 * Note : la vérification du RÔLE (super_admin vs hotel_user) est faite
 * côté serveur dans les layouts / pages via requireRole(). Le middleware
 * ne vérifie que l'authentification (présence d'une session).
 */

/** Routes nécessitant une authentification. */
const PROTECTED_PREFIXES = ["/super-admin", "/app"];

/** Routes publiques d'auth où un utilisateur connecté n'a rien à faire. */
const AUTH_PATHS = ["/login"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase n'est pas configuré (ex : sandbox sans .env), on continue
  // sans rafraîchir la session — évite de planter le dev local.
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT : ne pas oublier await supabase.auth.getUser() pour rafraîchir
  // la session. Ne pas appeler directement supabase.auth.getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Route protégée sans utilisateur → redirect vers /login
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Un utilisateur déjà connecté qui va sur /login est redirigé
  // vers son dashboard. La détermination du rôle exact se fait
  // côté serveur dans la page /login (getCurrentProfile).
  // Ici on ne redirige que si on est certain que l'utilisateur existe,
  // pour éviter une boucle si la table profiles n'est pas encore créée.
  // → On laisse la page /login gérer ce cas.

  return supabaseResponse;
}
