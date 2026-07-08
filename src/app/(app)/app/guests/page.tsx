import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getGuests } from "@/lib/hotel/guests-server";
import { GuestsList } from "@/components/hotel/guests-list";

export const metadata = {
  title: "Clients",
};

type SearchParams = Promise<{
  search?: string;
  page?: string;
}>;

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const search = sp.search ?? "";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          Aucun établissement associé à votre compte.
        </p>
      </div>
    );
  }

  const result = await getGuests(profile.establishment_id, {
    search,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 10,
  });

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Clients
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les fiches de vos clients. Réutilisez-les lors des réservations
          pour gagner du temps.
        </p>
      </div>

      <Suspense fallback={null}>
        <GuestsList
          guests={result.guests}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          canEdit={canEdit}
          initialSearch={search}
        />
      </Suspense>
    </div>
  );
}
