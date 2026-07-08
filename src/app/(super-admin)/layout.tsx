import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { SuperAdminShell } from "@/components/super-admin/shell";

/**
 * Layout defense-in-depth pour /super-admin/*.
 *
 * Le middleware vérifie déjà le rôle, mais cette vérification côté serveur
 * ajoute une couche de sécurité au cas où le middleware serait bypassé.
 *
 * En sandbox (pas de Supabase), getCurrentProfile() retourne null →
 * on laisse passer (le middleware gère en production).
 */
export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // Si Supabase est configuré et l'utilisateur est connecté mais pas super_admin
  // → rediriger vers /unauthorized
  if (profile && !isSuperAdmin(profile.role)) {
    redirect("/unauthorized");
  }

  // Passe le profil au shell client pour le topbar
  return (
    <SuperAdminShell
      profile={
        profile
          ? {
              full_name: profile.full_name,
              email: profile.email,
              role: profile.role,
            }
          : null
      }
    >
      {children}
    </SuperAdminShell>
  );
}
