import Link from "next/link";
import {
  BedDouble,
  CalendarCheck,
  Users,
  Wallet,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatFCFA, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Tableau de bord",
};

export default async function AppDashboardPage() {
  const profile = await getCurrentProfile();

  // Stats défensif : si Supabase mal configuré, on affiche des zéros
  let stats = {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    todayCheckIns: 0,
    todayCheckOuts: 0,
    activeGuests: 0,
    monthRevenue: 0,
    pendingBalance: 0,
  };
  let recentReservations: any[] = [];
  let todayArrivals: any[] = [];
  let todayDepartures: any[] = [];

  if (profile?.establishment_id) {
    try {
      const supabase = createSupabaseAdminClient();
      const estId = profile.establishment_id;
      const today = new Date().toISOString().split("T")[0];
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];

      // Stats chambres
      const { data: rooms } = await supabase
        .from("rooms")
        .select("status")
        .eq("establishment_id", estId)
        .neq("status", "inactive");

      if (rooms) {
        stats.totalRooms = rooms.length;
        stats.availableRooms = rooms.filter((r) => r.status === "available").length;
        stats.occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
      }

      // Check-ins du jour
      const { data: checkIns } = await supabase
        .from("reservations")
        .select(
          `id, check_in_date, guest:guests(full_name), room:rooms(room_number)`
        )
        .eq("establishment_id", estId)
        .eq("check_in_date", today)
        .in("status", ["confirmed", "checked_in"]);

      stats.todayCheckIns = checkIns?.length ?? 0;
      todayArrivals = checkIns ?? [];

      // Check-outs du jour
      const { data: checkOuts } = await supabase
        .from("reservations")
        .select(
          `id, check_out_date, guest:guests(full_name), room:rooms(room_number)`
        )
        .eq("establishment_id", estId)
        .eq("check_out_date", today)
        .in("status", ["checked_in", "checked_out"]);

      stats.todayCheckOuts = checkOuts?.length ?? 0;
      todayDepartures = checkOuts ?? [];

      // Clients actifs (séjours en cours)
      const { count: activeCount } = await supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("establishment_id", estId)
        .eq("status", "checked_in");

      stats.activeGuests = activeCount ?? 0;

      // Revenu du mois (paiements validés)
      const { data: payments } = await supabase
        .from("stay_payments")
        .select("amount")
        .eq("establishment_id", estId)
        .gte("payment_date", startOfMonth);

      stats.monthRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;

      // Solde impayé
      const { data: unpaidRes } = await supabase
        .from("reservations")
        .select("balance_amount")
        .eq("establishment_id", estId)
        .in("status", ["confirmed", "checked_in"])
        .gt("balance_amount", 0);

      stats.pendingBalance =
        unpaidRes?.reduce((sum, r) => sum + (r.balance_amount || 0), 0) ?? 0;

      // Réservations récentes
      const { data: recent } = await supabase
        .from("reservations")
        .select(
          `id, check_in_date, check_out_date, status, total_amount, balance_amount,
          guest:guests(full_name), room:rooms(room_number)`
        )
        .eq("establishment_id", estId)
        .order("created_at", { ascending: false })
        .limit(5);

      recentReservations = recent ?? [];
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  }

  if (!profile?.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Tableau de bord
        </h1>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aucun établissement associé à votre compte.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;

  const statCards = [
    {
      label: "Chambres disponibles",
      value: `${stats.availableRooms}/${stats.totalRooms}`,
      icon: BedDouble,
      color: "text-emerald-700",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Taux d'occupation",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "text-blue-700",
      bg: "bg-blue-500/10",
    },
    {
      label: "Clients en séjour",
      value: stats.activeGuests,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Revenus du mois",
      value: formatFCFA(stats.monthRevenue),
      icon: Wallet,
      color: "text-emerald-700",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bienvenue, {profile.full_name ?? profile.email} — voici l'activité de votre établissement.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/reservations?walkin=1">
              <Zap className="mr-1.5 h-4 w-4 text-orange-600" />
              Walk-In
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app/reservations?new=1">
              <CalendarCheck className="mr-1.5 h-4 w-4" />
              Réservation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertes */}
      {stats.pendingBalance > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Solde impayé : {formatFCFA(stats.pendingBalance)}
              </p>
              <p className="text-xs text-amber-700">
                Des séjours en cours ont un solde restant. Encaissez les paiements avant le check-out.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Arrivées du jour */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Arrivées du jour</CardTitle>
              <CardDescription>{stats.todayCheckIns} prévue(s)</CardDescription>
            </div>
            <LogIn className="h-5 w-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            {todayArrivals.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune arrivée prévue aujourd'hui
              </p>
            ) : (
              <div className="space-y-2">
                {todayArrivals.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {r.guest?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chambre {r.room?.room_number ?? "—"}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/app/reservations/${r.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Départs du jour */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Départs du jour</CardTitle>
              <CardDescription>{stats.todayCheckOuts} prévu(s)</CardDescription>
            </div>
            <LogOut className="h-5 w-5 text-blue-700" />
          </CardHeader>
          <CardContent>
            {todayDepartures.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun départ prévu aujourd'hui
              </p>
            ) : (
              <div className="space-y-2">
                {todayDepartures.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {r.guest?.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chambre {r.room?.room_number ?? "—"}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/app/reservations/${r.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Réservations récentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Réservations récentes</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/app/reservations">
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentReservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Aucune réservation pour le moment.
              </p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/app/reservations?new=1">
                  <CalendarCheck className="mr-1.5 h-4 w-4" />
                  Créer une réservation
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Client</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Chambre</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Arrivée</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Total</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/app/reservations/${r.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {r.guest?.full_name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">{r.room?.room_number ?? "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {formatDate(r.check_in_date)}
                      </td>
                      <td className="px-3 py-2.5 font-medium">
                        {formatFCFA(r.total_amount ?? 0)}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.balance_amount > 0 ? (
                          <span className="font-medium text-destructive">
                            {formatFCFA(r.balance_amount)}
                          </span>
                        ) : (
                          <span className="text-emerald-700">Payé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
