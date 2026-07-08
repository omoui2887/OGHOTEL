import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getStayPayments } from "@/lib/hotel/payments-server";
import { getReservations } from "@/lib/hotel/reservations-server";
import { PaymentsList } from "@/components/hotel/payments-list";

export const metadata = {
  title: "Paiements",
};

type SearchParams = Promise<{
  search?: string;
  method?: string;
  page?: string;
}>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const search = sp.search ?? "";
  const method = sp.method ?? "all";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const [result, reservationsResult] = await Promise.all([
    getStayPayments(profile.establishment_id, {
      search,
      method,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      pageSize: 10,
    }),
    getReservations(profile.establishment_id, {
      status: "all",
      pageSize: 100,
    }),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist", "accountant"].includes(
    profile.role
  );

  const openReservations = reservationsResult.reservations
    .filter((r) => ["confirmed", "checked_in"].includes(r.status))
    .map((r) => ({
      id: r.id,
      guest_name: r.guest_name,
      room_number: r.room_number,
      balance_amount: r.balance_amount,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Paiements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historique des paiements encaissés. Chaque paiement met à jour
          automatiquement le solde de la réservation.
        </p>
      </div>

      <Suspense fallback={null}>
        <PaymentsList
          payments={result.payments}
          total={result.total}
          totalAmount={result.totalAmount}
          page={result.page}
          totalPages={result.totalPages}
          initialSearch={search}
          initialMethod={method}
          canEdit={canEdit}
          reservations={openReservations}
        />
      </Suspense>
    </div>
  );
}
