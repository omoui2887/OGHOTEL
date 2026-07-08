import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getReports } from "@/lib/hotel/reports-server";
import { ReportsView } from "@/components/hotel/reports-view";

export const metadata = {
  title: "Rapports",
};

type SearchParams = Promise<{
  period?: string;
}>;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const period = sp.period ?? "month";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  // Vérifier les permissions
  if (!["hotel_admin", "manager", "accountant"].includes(profile.role)) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-sm text-destructive">
          Vous n'avez pas la permission d'accéder aux rapports. Seuls l'Admin
          Hôtel, le Manager et le Comptable peuvent consulter les rapports.
        </p>
      </div>
    );
  }

  const data = await getReports(profile.establishment_id, period);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <p className="text-sm text-muted-foreground">
          Impossible de charger les rapports. Réessayez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Rapports & Statistiques
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble de votre établissement : occupation, recettes, dépenses,
          résultat net et tendances. Filtrez par période et exportez en CSV.
        </p>
      </div>

      <Suspense fallback={null}>
        <ReportsView data={data} initialPeriod={period} />
      </Suspense>
    </div>
  );
}
