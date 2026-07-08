import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getHousekeepingTasks } from "@/lib/hotel/housekeeping-server";
import { getRooms } from "@/lib/hotel/rooms-server";
import { HousekeepingList } from "@/components/hotel/housekeeping-list";

export const metadata = {
  title: "Ménage",
};

type SearchParams = Promise<{
  status?: string;
  page?: string;
}>;

export default async function HousekeepingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const status = sp.status ?? "all";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Ménage</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const [result, rooms] = await Promise.all([
    getHousekeepingTasks(profile.establishment_id, {
      status,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      pageSize: 20,
    }),
    getRooms(profile.establishment_id),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist", "housekeeping"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Ménage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez les tâches de nettoyage. Les tâches sont créées automatiquement
          après chaque check-out. Marquez la chambre comme "inspectée" pour la
          rendre disponible.
        </p>
      </div>

      <Suspense fallback={null}>
        <HousekeepingList
          tasks={result.tasks}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialStatus={status}
          canEdit={canEdit}
          rooms={rooms.map((r) => ({
            id: r.id,
            room_number: r.room_number,
            status: r.status,
          }))}
        />
      </Suspense>
    </div>
  );
}
