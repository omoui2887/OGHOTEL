import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getReservations } from "@/lib/hotel/reservations-server";
import { getRooms } from "@/lib/hotel/rooms-server";
import { ReservationsList } from "@/components/hotel/reservations-list";

export const metadata = {
  title: "Réservations",
};

type SearchParams = Promise<{
  search?: string;
  status?: string;
  room_id?: string;
  page?: string;
}>;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const search = sp.search ?? "";
  const status = sp.status ?? "all";
  const roomId = sp.room_id ?? "all";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const [result, rooms] = await Promise.all([
    getReservations(profile.establishment_id, {
      search,
      status,
      room_id: roomId,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      pageSize: 10,
    }),
    getRooms(profile.establishment_id),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Réservations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les réservations de votre établissement. Le système empêche
          automatiquement les doubles réservations.
        </p>
      </div>

      <Suspense fallback={null}>
        <ReservationsList
          reservations={result.reservations}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          rooms={rooms.map((r) => ({ id: r.id, room_number: r.room_number }))}
          initialSearch={search}
          initialStatus={status}
          initialRoomId={roomId}
          canEdit={canEdit}
        />
      </Suspense>
    </div>
  );
}
