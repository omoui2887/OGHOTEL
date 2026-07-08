import { getCurrentProfile } from "@/lib/auth";
import { getRoomTypes } from "@/lib/hotel/room-types-server";
import { getRooms } from "@/lib/hotel/rooms-server";
import { RoomsList } from "@/components/hotel/rooms-list";

export const metadata = {
  title: "Chambres",
};

export default async function RoomsPage() {
  const profile = await getCurrentProfile();

  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Chambres</h1>
        <p className="text-sm text-muted-foreground">
          Aucun établissement associé à votre compte.
        </p>
      </div>
    );
  }

  const [rooms, roomTypes] = await Promise.all([
    getRooms(profile.establishment_id),
    getRoomTypes(profile.establishment_id),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist", "housekeeping"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Chambres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez toutes les chambres de votre établissement. Changez le statut
          rapidement (disponible, occupée, nettoyage...) pour suivre l'état en
          temps réel.
        </p>
      </div>

      <RoomsList rooms={rooms} roomTypes={roomTypes} canEdit={canEdit} />
    </div>
  );
}
