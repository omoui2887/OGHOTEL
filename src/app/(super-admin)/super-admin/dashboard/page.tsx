import Link from "next/link";
import {
  Users, UserPlus, Building2, Building, AlertOctagon,
  Wallet, TrendingUp, Ticket, CheckCircle2, Clock,
  ArrowRight, MessageCircle, Phone, Inbox,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/super-admin/stat-card";
import { RevenueChart, ClientsByPlanChart } from "@/components/super-admin/charts";
import { ExportButton } from "@/components/shared/export-button";
import {
  getSuperAdminStats, getRecentLeads, getRevenueByMonth, getClientsByPlan,
} from "@/lib/super-admin/stats";
import { formatFCFA, formatDate, buildWhatsAppUrl } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const LEAD_STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nouveau", variant: "default" },
  contacted: { label: "Contacté", variant: "secondary" },
  negotiating: { label: "Négociation", variant: "secondary" },
  won: { label: "Gagné", variant: "default" },
  lost: { label: "Perdu", variant: "destructive" },
};

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  hotel: "Hôtel", residence: "Résidence", auberge: "Auberge", other: "Autre",
};

export default async function SuperAdminDashboardPage() {
  const [stats, recentLeads, revenueByMonth, clientsByPlan] = await Promise.all([
    getSuperAdminStats().catch(() => null),
    getRecentLeads(5).catch(() => []),
    getRevenueByMonth().catch(() => []),
    getClientsByPlan().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      {/* Header avec export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d'ensemble de la plateforme {APP_NAME} — prospects, clients, revenus et codes d'activation.
          </p>
        </div>
        <ExportButton scope="super-admin" />
      </div>

      {!stats ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertOctagon className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <p className="text-sm font-medium">Impossible de charger les statistiques</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vérifiez la configuration Supabase et les variables d'environnement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cartes statistiques — ligne 1 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total prospects" value={stats.leads.total} icon={Users}
              hint={`${stats.leads.new} nouveaux, ${stats.leads.contacted} contactés`} variant="info" />
            <StatCard label="Nouveaux prospects" value={stats.leads.new} icon={UserPlus}
              hint="En attente de contact" variant="warning" />
            <StatCard label="Clients actifs" value={stats.establishments.active} icon={Building2}
              hint={`sur ${stats.establishments.total} total`} variant="success" />
            <StatCard label="Clients expirés" value={stats.establishments.expired} icon={Building}
              hint="À relancer" variant="danger" />
          </div>

          {/* Cartes statistiques — ligne 2 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Clients suspendus" value={stats.establishments.suspended} icon={AlertOctagon}
              hint="Comptes désactivés" variant="danger" />
            <StatCard label="Revenus du mois" value={formatFCFA(stats.payments.monthRevenue)} icon={Wallet}
              hint="Paiements validés ce mois" variant="success" />
            <StatCard label="Revenus annuels" value={formatFCFA(stats.payments.yearRevenue)} icon={TrendingUp}
              hint="Cumul de l'année" variant="default" />
            <StatCard label="Codes générés" value={stats.codes.total} icon={Ticket}
              hint={`${stats.codes.used} utilisés, ${stats.codes.expired} expirés`} variant="info" />
          </div>

          {/* Graphiques */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={revenueByMonth} />
            <ClientsByPlanChart data={clientsByPlan} />
          </div>

          {/* Dernières demandes + Actions rapides */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Dernières demandes (2/3) */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">Dernières demandes</CardTitle>
                  <CardDescription className="text-xs">Prospects récents de la landing page</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/super-admin/leads">Voir tout <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Aucune demande pour le moment</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Les prospects qui remplissent le formulaire apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => {
                      const statusInfo = LEAD_STATUS_LABELS[lead.status] ?? { label: lead.status, variant: "outline" as const };
                      return (
                        <div key={lead.id} className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{lead.full_name}</p>
                              <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {lead.business_name} · {BUSINESS_TYPE_LABELS[lead.business_type] ?? lead.business_type}
                              {lead.city ? ` · ${lead.city}` : ""}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                              {lead.desired_plan_name && <span className="text-primary font-medium">{lead.desired_plan_name}</span>}
                              <span>{formatDate(lead.created_at)}</span>
                            </div>
                          </div>
                          <Button asChild variant="ghost" size="icon" className="shrink-0">
                            <a href={buildWhatsAppUrl(lead.phone, `Bonjour ${lead.full_name}, je vous contacte concernant votre demande pour ${APP_NAME}.`)}
                              target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                              <MessageCircle className="h-4 w-4 text-emerald-500" />
                            </a>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides (1/3) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions rapides</CardTitle>
                <CardDescription className="text-xs">Accès direct aux tâches courantes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/super-admin/leads"><Users className="mr-2 h-4 w-4" />Voir les prospects</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/super-admin/payments"><Wallet className="mr-2 h-4 w-4" />Enregistrer un paiement</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/super-admin/activation-codes"><Ticket className="mr-2 h-4 w-4" />Générer un code</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/super-admin/clients"><Building2 className="mr-2 h-4 w-4" />Voir les clients</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/super-admin/plans"><CheckCircle2 className="mr-2 h-4 w-4" />Gérer les formules</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Abonnements expirant bientôt */}
          {stats.expiringSoon.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base">Abonnements expirant bientôt</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Établissements dont l'abonnement expire dans les 30 prochains jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.expiringSoon.map((est) => (
                    <div key={est.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="font-medium text-sm">{est.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {est.owner_name ?? "—"} · {est.plan_name ?? "Sans formule"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                        {formatDate(est.subscription_end)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
