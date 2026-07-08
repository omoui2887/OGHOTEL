import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Wallet, Users, Building2 } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export const metadata = { title: "Rapports" };

export default async function ReportsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();

  const { data: payments } = await supabase
    .from("subscription_payments")
    .select("amount_fcfa, status, payment_method, paid_at")
    .eq("status", "validated")
    .order("paid_at", { ascending: false });

  const { count: totalLeads } = await supabase
    .from("leads").select("id", { count: "exact", head: true });

  const { count: totalClients } = await supabase
    .from("establishments").select("id", { count: "exact", head: true });

  const { count: activeCodes } = await supabase
    .from("activation_codes").select("id", { count: "exact", head: true })
    .in("status", ["generated", "sent"]);

  const totalRevenue = (payments ?? []).reduce((s: number, p: any) => s + p.amount_fcfa, 0);

  const methodMap = new Map<string, number>();
  (payments ?? []).forEach((p: any) => {
    methodMap.set(p.payment_method, (methodMap.get(p.payment_method) || 0) + p.amount_fcfa);
  });

  const METHOD_LABELS: Record<string, string> = {
    orange: "Orange Money", mtn: "MTN Money", moov: "Moov Money",
    wave: "Wave", cash: "Espèces", card: "Carte", transfer: "Virement",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Rapports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble des revenus et statistiques de la plateforme.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenu total</p>
              <p className="text-xl font-bold">{formatFCFA(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total prospects</p>
              <p className="text-xl font-bold">{totalLeads ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clients</p>
              <p className="text-xl font-bold">{totalClients ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Codes actifs</p>
              <p className="text-xl font-bold">{activeCodes ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenus par moyen de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {methodMap.size > 0 ? (
            <div className="space-y-2">
              {Array.from(methodMap.entries()).sort((a, b) => b[1] - a[1]).map(([method, total]) => (
                <div key={method} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">{METHOD_LABELS[method] ?? method}</span>
                  <span className="font-bold text-emerald-600">{formatFCFA(total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Aucun paiement validé pour le moment</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
