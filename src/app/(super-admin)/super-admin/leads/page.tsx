import { Suspense } from "react";
import { getLeads, getDistinctCities, getPlansForFilter } from "@/lib/super-admin/leads-server";
import { LeadsTable } from "@/components/super-admin/leads-table";

export const metadata = {
  title: "Prospects",
};

type SearchParams = Promise<{
  search?: string;
  status?: string;
  city?: string;
  plan_id?: string;
  page?: string;
}>;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const filters = {
    search: sp.search ?? "",
    status: sp.status ?? "all",
    city: sp.city ?? "all",
    plan_id: sp.plan_id ?? "all",
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 10,
  };

  // Fetch défensif : si Supabase n'est pas configuré ou qu'une erreur
  // réseau/DB survient, on affiche la page avec des listes vides au lieu
  // de planter toute la page via l'error boundary global.
  let result: Awaited<ReturnType<typeof getLeads>> = {
    leads: [],
    total: 0,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: 0,
  };
  let cities: Awaited<ReturnType<typeof getDistinctCities>> = [];
  let plans: Awaited<ReturnType<typeof getPlansForFilter>> = [];

  try {
    [result, cities, plans] = await Promise.all([
      getLeads(filters),
      getDistinctCities(),
      getPlansForFilter(),
    ]);
  } catch (err) {
    console.error("Erreur chargement prospects:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Prospects
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les demandes provenant de la landing page. Contactez les prospects par WhatsApp ou appel, suivez leur statut.
        </p>
      </div>

      {/* Tableau avec filtres */}
      <Suspense fallback={null}>
        <LeadsTable
          initialLeads={result.leads}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          totalPages={result.totalPages}
          cities={cities}
          plans={plans}
          initialFilters={{
            search: filters.search,
            status: filters.status,
            city: filters.city,
            plan_id: filters.plan_id,
          }}
        />
      </Suspense>
    </div>
  );
}
