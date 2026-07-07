/**
 * Schéma de la base de données Supabase — placeholder.
 *
 * En production, ce type sera généré automatiquement depuis le schéma
 * PostgreSQL via `supabase gen types typescript`.
 * Voir : https://supabase.com/docs/reference/javascript/typescript-support
 *
 * Pour l'instant, on déclare un type vide pour permettre l'import
 * et l'extension future sans casser la compilation.
 */
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
