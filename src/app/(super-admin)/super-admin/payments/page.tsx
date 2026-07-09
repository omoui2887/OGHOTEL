import { Suspense } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getPayments } from "@/lib/super-admin/payments-server";
import { PaymentsList } from "@/components/super-admin/payments-list";

export const metadata = {
  title: "Paiements SaaS",
};

type SearchParams = Promise<{
  status?: string;
  page?: string;
}>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const status = sp.status ?? "all";

  // Fetch défensif : si Supabase n'est pas configuré ou qu'une erreur
  // réseau/DB survient, on affiche la page avec des listes vides au lieu
  // de planter toute la page via l'error boundary global.
  let result: Awaited<ReturnType<typeof getPayments>> = {
    payments: [],
    total: 0,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 10,
    totalPages: 0,
  };
  let leads: Awaited<ReturnType<typeof getLeadsForPayment>> = [];
  let establishments: Awaited<ReturnType<typeof getEstablishmentsForPayment>> = [];
  let plans: Awaited<ReturnType<typeof getPlansForPayment>> = [];

  try {
    [result, leads, establishments, plans] = await Promise.all([
      getPayments({ status, page: Number.isNaN(page) || page < 1 ? 1 : page, pageSize: 10 }),
      getLeadsForPayment(),
      getEstablishmentsForPayment(),
      getPlansForPayment(),
    ]);
  } catch (err) {
    console.error("Erreur chargement paiements SaaS:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Paiements SaaS
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enregistrez les paiements Mobile Money des prospects, validez-les, puis
          générez un code d'activation unique.
        </p>
      </div>

      <Suspense fallback={null}>
        <PaymentsList
          payments={result.payments}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialStatus={status}
          leads={leads}
          establishments={establishments}
          plans={plans}
        />
      </Suspense>
    </div>
  );
}

async function getLeadsForPayment() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("leads")
    .select("id, full_name, business_name")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as { id: string; full_name: string; business_name: string }[];
}

async function getEstablishmentsForPayment() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("establishments")
    .select("id, name, owner_name")
    .order("name", { ascending: true });
  return (data ?? []) as {
    id: string;
    name: string;
    owner_name: string | null;
  }[];
}

async function getPlansForPayment() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("plans")
    .select("id, name, price_fcfa")
    .eq("is_active", true)
    .order("price_fcfa", { ascending: true });
  return (data ?? []) as { id: string; name: string; price_fcfa: number }[];
}
