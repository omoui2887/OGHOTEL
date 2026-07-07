import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware Supabase — rafraîchit la session Auth sur chaque requête
 * et propage les cookies mis à jour vers le navigateur.
 *
 * À étendre plus tard pour protéger les routes /super-admin/* et /app/*.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase n'est pas configuré (ex : preview sans .env), on continue
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
  await supabase.auth.getUser();

  return supabaseResponse;
}
