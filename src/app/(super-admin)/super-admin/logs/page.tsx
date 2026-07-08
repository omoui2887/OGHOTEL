import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { getActivityLogs } from "@/lib/super-admin/logs-server";
import { ACTION_LABELS } from "@/lib/super-admin/logs";
import { LogsList } from "@/components/super-admin/logs-list";

export const metadata = {
  title: "Journal d'activité",
};

type SearchParams = Promise<{
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: string;
}>;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const action = sp.action ?? "all";
  const dateFrom = sp.date_from ?? "";
  const dateTo = sp.date_to ?? "";

  const profile = await getCurrentProfile();
  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Journal d'activité</h1>
        <p className="text-sm text-muted-foreground">Non authentifié.</p>
      </div>
    );
  }

  const result = await getActivityLogs({
    action,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
    pageSize: 30,
  });

  // Liste unique des actions pour le filtre
  const allActions = Object.keys({
    "lead_status_changed": true,
    "saas_payment_created": true,
    "saas_payment_status_changed": true,
    "activation_code_generated": true,
    "plan_updated": true,
    "reservation_created": true,
    "reservation_updated": true,
    "reservation_cancelled": true,
    "check_in": true,
    "check_out": true,
    "stay_payment_created": true,
    "expense_created": true,
    "housekeeping_task_updated": true,
    "maintenance_ticket_created": true,
    "staff_user_created": true,
    "staff_user_updated": true,
    "establishment_settings_updated": true,
    "invoice_generated": true,
    "account_activated": true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Journal d'activité
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trace de toutes les actions importantes : connexions, réservations,
          paiements, check-in/out, dépenses, modifications de paramètres...
        </p>
      </div>

      <Suspense fallback={null}>
        <LogsList
          logs={result.logs}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          initialAction={action}
          initialDateFrom={dateFrom}
          initialDateTo={dateTo}
          actions={allActions}
        />
      </Suspense>
    </div>
  );
}
