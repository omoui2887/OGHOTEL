import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté serveur (Server Components, Route Handlers, Server Actions).
 *
 * Utilise uniquement les variables NEXT_PUBLIC_* + la session cookie.
 * Ne jamais utiliser la clé service_role ici — pour les opérations
 * administrateur critiques, utiliser une Route Handler dédiée qui vérifie
 * le rôle super_admin et appelle le client service côté serveur uniquement.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configuration Supabase manquante. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignoré : appelé depuis un Server Component où on ne peut pas
          // modifier les cookies. Le middleware se chargera de rafraîchir.
        }
      },
    },
  });
}

/**
 * Client Supabase avec la clé service_role.
 *
 * ⚠️ DANGEREUX — contourne toute la RLS.
 * À utiliser UNIQUEMENT dans des Route Handlers / Server Actions très
 * spécifiques (ex : seed initial, opération d'administration globale)
 * et TOUJOURS après vérification du rôle super_admin.
 *
 * Ne JAMAIS importer cette fonction dans un composant client.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Configuration admin Supabase manquante. Définissez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local (côté serveur uniquement)"
    );
  }

  return createServerClient(url, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op : le client admin ne gère pas de session cookie.
      },
    },
  });
}
