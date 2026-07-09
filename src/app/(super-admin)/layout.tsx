import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { SuperAdminShell } from "@/components/super-admin/shell";
import { getSuperAdminNotifications } from "@/lib/notifications";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // Si non connecté (middleware aurait dû rediriger, mais defense-in-depth),
  // on redirige vers /login. Si connecté mais pas super_admin ou inactif,
  // on redirige vers /unauthorized.
  if (!profile) {
    redirect("/login?redirect=/super-admin/dashboard");
  }
  if (!profile.is_active || !isSuperAdmin(profile.role)) {
    redirect("/unauthorized");
  }

  // Fetch notifications (dynamic, server-side)
  let notifications: any[] = [];
  let unreadCount = 0;
  try {
    const result = await getSuperAdminNotifications();
    notifications = result.notifications;
    unreadCount = result.unread_count;
  } catch {
    // Si erreur, on continue sans notifications
  }

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
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </SuperAdminShell>
  );
}
