import { getCurrentProfile } from "@/lib/auth";
import { getStaffUsers, getPlanLimits } from "@/lib/hotel/users-server";
import { UsersList } from "@/components/hotel/users-list";

export const metadata = {
  title: "Personnel",
};

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Personnel</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  // Seul hotel_admin peut gérer le personnel
  if (profile.role !== "hotel_admin") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Personnel</h1>
        <p className="text-sm text-destructive">
          Vous n'avez pas la permission de gérer le personnel. Seul l'Admin Hôtel peut accéder à ce module.
        </p>
      </div>
    );
  }

  const [users, planLimits] = await Promise.all([
    getStaffUsers(profile.establishment_id),
    getPlanLimits(profile.establishment_id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Personnel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les comptes de votre équipe. Chaque rôle a des permissions
          spécifiques. La limite d'utilisateurs dépend de votre formule.
        </p>
      </div>

      <UsersList
        users={users}
        planLimits={planLimits}
        currentUserId={profile.id}
      />
    </div>
  );
}
