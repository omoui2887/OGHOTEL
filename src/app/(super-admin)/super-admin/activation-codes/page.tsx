import { Suspense } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getActivationCodes } from "@/lib/super-admin/activation-codes-server";
import { CodesList } from "@/components/super-admin/codes-list";

export const metadata = {
  title: "Codes d'activation",
};

type SearchParams = Promise<{
  status?: string;
  page?: string;
}>;

export default async function ActivationCodesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const status = sp.status ?? "all";

  const supabase = createSupabaseAdminClient();
  const { data: plans } = await supabase
    .from("plans")
    .select("id, name")
    .eq("is_active", true)
    .order("price_fcfa", { ascending: true });

  const result = await getActivationCodes({
    status,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Codes d'activation
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Codes générés après validation d'un paiement. Chaque code est unique,
          à usage unique, et expire après 30 jours. Vous pouvez aussi générer
          des codes d'essai de 24h pour faire tester le SaaS.
        </p>
      </div>

      <Suspense fallback={null}>
        <CodesList
          codes={result.codes}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialStatus={status}
          plans={plans ?? []}
        />
      </Suspense>
    </div>
  );
}
