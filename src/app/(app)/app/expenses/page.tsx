import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getExpenses } from "@/lib/hotel/expenses-server";
import { ExpensesList } from "@/components/hotel/expenses-list";
import { PermissionDenied } from "@/components/hotel/permission-denied";
import { canAccessModule } from "@/lib/roles";

export const metadata = {
  title: "Dépenses",
};

type SearchParams = Promise<{
  category?: string;
  date_from?: string;
  date_to?: string;
  page?: string;
}>;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const category = sp.category ?? "all";
  const dateFrom = sp.date_from ?? "";
  const dateTo = sp.date_to ?? "";

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dépenses</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  if (!canAccessModule(profile.role, "/app/expenses")) {
    return <PermissionDenied />;
  }

  const result = await getExpenses(profile.establishment_id, {
    category,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 20,
  });

  const canEdit = ["hotel_admin", "manager", "accountant"].includes(profile.role);
  const canDelete = profile.role === "hotel_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dépenses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivez les dépenses de votre établissement (salaires, électricité,
          eau, fournitures...). Ces données alimentent le rapport de résultat net.
        </p>
      </div>

      <Suspense fallback={null}>
        <ExpensesList
          expenses={result.expenses}
          total={result.total}
          totalAmount={result.totalAmount}
          byCategory={result.byCategory}
          page={result.page}
          totalPages={result.totalPages}
          initialCategory={category}
          initialDateFrom={dateFrom}
          initialDateTo={dateTo}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </Suspense>
    </div>
  );
}
