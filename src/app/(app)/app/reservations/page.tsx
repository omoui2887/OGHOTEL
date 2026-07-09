import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getReservations } from "@/lib/hotel/reservations-server";
import { getRooms } from "@/lib/hotel/rooms-server";
import { getGuests } from "@/lib/hotel/guests-server";
import { ReservationsList } from "@/components/hotel/reservations-list";
import type { Reservation } from "@/lib/hotel/reservations";
import type { Room } from "@/lib/hotel/rooms";
import type { Guest } from "@/lib/hotel/guests";

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

  // Fetch défensif : si une erreur survient (Supabase indisponible, table
  // manquante, etc.), on affiche la page avec des listes vides au lieu de
  // planter toute la page via l'error boundary global.
  let reservations: Reservation[] = [];
  let total = 0;
  let resultPage = 1;
  let totalPages = 0;
  let rooms: Room[] = [];
  let guests: Guest[] = [];

  try {
    const [result, roomsData, guestsData] = await Promise.all([
      getReservations(profile.establishment_id, {
        search,
        status,
        room_id: roomId,
        page: Number.isNaN(page) || page < 1 ? 1 : page,
        pageSize: 10,
      }),
      getRooms(profile.establishment_id),
      getGuests(profile.establishment_id, { pageSize: 200 }),
    ]);
    reservations = result.reservations;
    total = result.total;
    resultPage = result.page;
    totalPages = result.totalPages;
    rooms = roomsData;
    guests = guestsData.guests;
  } catch (err) {
    console.error("Erreur chargement réservations:", err);
  }

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
          reservations={reservations}
          total={total}
          page={resultPage}
          totalPages={totalPages}
          rooms={rooms}
          guests={guests}
          initialSearch={search}
          initialStatus={status}
          initialRoomId={roomId}
          canEdit={canEdit}
        />
      </Suspense>
    </div>
  );
}
