import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isHotelUser } from "@/lib/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { HotelShell } from "@/components/hotel/shell";
import { getHotelNotifications } from "@/lib/notifications";

/**
 * Layout /app/* — espace établissement.
 *
 * 🔒 Sécurité :
 * - Defense-in-depth : vérifie le rôle côté serveur en plus du middleware.
 * - Récupère le profil + établissement + features du plan pour la sidebar.
 *
 * Si l'utilisateur n'est pas connecté ou pas hotel_user → redirect.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // En sandbox sans Supabase, on laisse passer (middleware gère).
  if (profile && !isHotelUser(profile.role)) {
    redirect("/unauthorized");
  }

  if (!profile) {
    // Soit pas connecté (middleware devrait rediriger), soit Supabase non configuré
    // On rend quand même pour permettre le dev sans auth
    return (
      <HotelShell
        profile={null}
        establishmentName={null}
        features={{}}
      >
        {children}
      </HotelShell>
    );
  }

  // Récupérer l'établissement + features du plan + notifications
  let establishmentName: string | null = null;
  let features: Record<string, boolean> = {};
  let notifications: any[] = [];
  let unreadCount = 0;

  if (profile.establishment_id) {
    const adminClient = createSupabaseAdminClient();
    const { data: est } = await adminClient
      .from("establishments")
      .select(`name, plan:plans(features)`)
      .eq("id", profile.establishment_id)
      .single();

    if (est) {
      establishmentName = est.name;
      features = (est as any).plan?.features ?? {};
    }

    // Fetch notifications
    try {
      const result = await getHotelNotifications(profile.establishment_id);
      notifications = result.notifications;
      unreadCount = result.unread_count;
    } catch {}
  }

  return (
    <HotelShell
      profile={{
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
      }}
      establishmentName={establishmentName}
      features={features}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </HotelShell>
  );
}
