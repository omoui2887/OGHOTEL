import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getInvoices } from "@/lib/hotel/invoices-server";
import { getReservations } from "@/lib/hotel/reservations-server";
import { InvoicesList } from "@/components/hotel/invoices-list";
import { PermissionDenied } from "@/components/hotel/permission-denied";
import { canAccessModule } from "@/lib/roles";

export const metadata = {
  title: "Factures & Reçus",
};

type SearchParams = Promise<{
  search?: string;
  status?: string;
  type?: string;
  page?: string;
}>;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const search = sp.search ?? "";
  const status = sp.status ?? "all";
  const type = sp.type ?? "all";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Factures & Reçus</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  if (!canAccessModule(profile.role, "/app/invoices")) {
    return <PermissionDenied />;
  }

  const [result, reservationsResult] = await Promise.all([
    getInvoices(profile.establishment_id, {
      search,
      status,
      type,
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
    .filter((r) => ["checked_in", "checked_out"].includes(r.status))
    .map((r) => ({
      id: r.id,
      guest_name: r.guest_name,
      room_number: r.room_number,
      balance_amount: r.balance_amount,
      total_amount: r.total_amount,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Factures & Reçus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Générez des factures et reçus professionnels. Imprimez-les directement
          depuis le navigateur ou exportez en PDF.
        </p>
      </div>

      <Suspense fallback={null}>
        <InvoicesList
          invoices={result.invoices}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialSearch={search}
          initialStatus={status}
          initialType={type}
          canEdit={canEdit}
          reservations={openReservations}
        />
      </Suspense>
    </div>
  );
}
