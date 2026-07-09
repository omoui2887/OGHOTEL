import { getCurrentProfile } from "@/lib/auth";
import { getRoomTypes } from "@/lib/hotel/room-types-server";
import { RoomTypesList } from "@/components/hotel/room-types-list";

export const metadata = {
  title: "Types de chambres",
};

export default async function RoomTypesPage() {
  const profile = await getCurrentProfile();

  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Types de chambres</h1>
        <p className="text-sm text-muted-foreground">
          Aucun établissement associé à votre compte. Si vous venez d'activer votre compte,
          déconnectez-vous puis reconnectez-vous.
        </p>
      </div>
    );
  }

  const roomTypes = await getRoomTypes(profile.establishment_id);

  // hotel_admin, manager, receptionist peuvent créer/modifier.
  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Types de chambres
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez vos types de chambres (Simple, Double, Suite...) avec un prix par
            défaut et une capacité. Vous pourrez ensuite créer vos chambres.
          </p>
        </div>
      </div>

      <RoomTypesList roomTypes={roomTypes} canEdit={canEdit} />
    </div>
  );
}
