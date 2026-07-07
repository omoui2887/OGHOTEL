import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur.
 *
 * Utilise UNIQUEMENT les variables d'environnement publiques (NEXT_PUBLIC_*).
 * Ne jamais importer la clé service_role ici.
 *
 * La sécurité des données repose sur les politiques RLS Supabase.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configuration Supabase manquante. Définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}
