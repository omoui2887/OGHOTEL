import { getCurrentProfile } from "@/lib/auth";
import { getConfirmedArrivals } from "@/lib/hotel/stay-server";
import { CheckInList } from "@/components/hotel/check-in-list";
import { PermissionDenied } from "@/components/hotel/permission-denied";
import { canAccessModule } from "@/lib/roles";

export const metadata = {
  title: "Check-in",
};

export default async function CheckInPage() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Check-in</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  if (!canAccessModule(profile.role, "/app/reservations")) {
    return <PermissionDenied />;
  }

  const arrivals = await getConfirmedArrivals(profile.establishment_id);

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Check-in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Arrivées confirmées des 7 prochains jours. Cliquez sur "Check-in"
          pour installer le client et encaisser un acompte si nécessaire.
        </p>
      </div>

      {canEdit ? (
        <CheckInList arrivals={arrivals} />
      ) : (
        <CheckInList arrivals={[]} />
      )}
    </div>
  );
}
