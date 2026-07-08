import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getMaintenanceTickets } from "@/lib/hotel/maintenance-server";
import { getRooms } from "@/lib/hotel/rooms-server";
import { MaintenanceList } from "@/components/hotel/maintenance-list";

export const metadata = {
  title: "Maintenance",
};

type SearchParams = Promise<{
  status?: string;
  priority?: string;
  page?: string;
}>;

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const status = sp.status ?? "all";
  const priority = sp.priority ?? "all";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const [result, rooms] = await Promise.all([
    getMaintenanceTickets(profile.establishment_id, {
      status,
      priority,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      pageSize: 20,
    }),
    getRooms(profile.establishment_id),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist", "maintenance"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Maintenance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signalez et suivez les incidents techniques. Lorsqu'un ticket est résolu,
          la chambre concernée redevient automatiquement disponible.
        </p>
      </div>

      <Suspense fallback={null}>
        <MaintenanceList
          tickets={result.tickets}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialStatus={status}
          initialPriority={priority}
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
