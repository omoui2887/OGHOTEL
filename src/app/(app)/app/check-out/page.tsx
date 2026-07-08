import { getCurrentProfile } from "@/lib/auth";
import { getActiveStays } from "@/lib/hotel/stay-server";
import { CheckOutList } from "@/components/hotel/check-out-list";

export const metadata = {
  title: "Check-out",
};

export default async function CheckOutPage() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Check-out</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const stays = await getActiveStays(profile.establishment_id);

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);
  const canForceUnpaid = profile.role === "hotel_admin" || profile.role === "manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Check-out
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Séjours en cours. Cliquez sur "Check-out" pour finaliser le départ,
          encaisser le solde et générer la facture. Une tâche de ménage sera
          créée automatiquement.
        </p>
      </div>

      {canEdit ? (
        <CheckOutList stays={stays} canForceUnpaid={canForceUnpaid} />
      ) : (
        <CheckOutList stays={[]} canForceUnpaid={false} />
      )}
    </div>
  );
}
