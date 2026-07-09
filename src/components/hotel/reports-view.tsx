"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download, TrendingUp, TrendingDown, Wallet, Percent,
  Users, BedDouble, BarChart3, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ReportsData } from "@/lib/hotel/reports-server";
import { formatFCFA } from "@/lib/utils";

const CHART_COLORS = ["#ff6b35", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4", "#84cc16"];

type Props = {
  data: ReportsData;
  initialPeriod: string;
};

export function ReportsView({ data, initialPeriod }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = React.useState(initialPeriod);

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const sp = new URLSearchParams(searchParams.toString());
    if (period && period !== "month") sp.set("period", period);
    else sp.delete("period");
    const qs = sp.toString();
    router.push(`/app/reports${qs ? "?" + qs : ""}`);
  }, [period, router, searchParams]);

  function exportCSV() {
    const rows: string[] = [];
    rows.push('"Rapport OGHOTEL — Période: ' + period + '"');
    rows.push("");
    rows.push('"INDICATEUR","VALEUR"');
    rows.push(`"Taux d'occupation","${data.occupancy.rate}%"`);
    rows.push(`"Recettes (mois)","${data.revenue.thisMonth}"`);
    rows.push(`"Recettes (année)","${data.revenue.thisYear}"`);
    rows.push(`"Dépenses totales","${data.netResult.expenses}"`);
    rows.push(`"Résultat net","${data.netResult.net}"`);
    rows.push(`"Paiements reçus","${data.payments.totalReceived}"`);
    rows.push(`"Solde impayé","${data.unpaid.totalBalance}"`);
    rows.push("");
    rows.push('"DÉPENSES PAR CATÉGORIE"');
    rows.push('"Catégorie","Montant","Nombre"');
    data.expensesByCategory.forEach((e) => {
      rows.push(`"${e.label}","${e.total}","${e.count}"`);
    });
    rows.push("");
    rows.push('"TOP CHAMBRES"');
    rows.push('"Chambre","Nuits","Revenu"');
    data.topRooms.forEach((r) => {
      rows.push(`"${r.room_number}","${r.nights}","${r.revenue}"`);
    });
    rows.push("");
    rows.push('"CLIENTS FRÉQUENTS"');
    rows.push('"Client","Séjours","Total payé"');
    data.topGuests.forEach((g) => {
      rows.push(`"${g.guest_name}","${g.stays}","${g.totalPaid}"`);
    });

    const csv = "\uFEFF" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport-${period}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Rapport CSV téléchargé");
  }

  const isProfit = data.netResult.net >= 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Période :</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">Ce mois-ci</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardContent>
      </Card>

      {/* Cartes statistiques principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux d'occupation</p>
              <p className="text-xl font-bold">{data.occupancy.rate}%</p>
              <p className="text-xs text-muted-foreground">
                {data.occupancy.occupiedNights}/{data.occupancy.totalNights} nuits
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recettes (mois)</p>
              <p className="text-xl font-bold">{formatFCFA(data.revenue.thisMonth)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dépenses</p>
              <p className="text-xl font-bold">{formatFCFA(data.netResult.expenses)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={isProfit ? "border-emerald-500/30" : "border-destructive/30"}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${isProfit ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"}`}>
              {isProfit ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Résultat net</p>
              <p className={`text-xl font-bold ${isProfit ? "text-emerald-600" : "text-destructive"}`}>
                {formatFCFA(data.netResult.net)}
              </p>
              <p className="text-xs text-muted-foreground">
                {isProfit ? "Bénéfice" : "Déficit"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recettes rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Recettes du jour</p>
            <p className="text-lg font-bold text-emerald-600">{formatFCFA(data.revenue.today)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Recettes (7 jours)</p>
            <p className="text-lg font-bold">{formatFCFA(data.revenue.thisWeek)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Recettes (année)</p>
            <p className="text-lg font-bold">{formatFCFA(data.revenue.thisYear)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenus par jour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recettes des 14 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenue.byDay.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.revenue.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatFCFA(v), "Recettes"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="revenue" fill="#ff6b35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Aucune recette sur cette période</div>
            )}
          </CardContent>
        </Card>

        {/* Revenus par mois */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recettes mensuelles (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenue.byMonth.some(m => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.revenue.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatFCFA(v), "Recettes"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="revenue" stroke="#ff6b35" strokeWidth={2} dot={{ fill: "#ff6b35", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Aucune recette sur cette période</div>
            )}
          </CardContent>
        </Card>

        {/* Dépenses par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            {data.expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.expensesByCategory} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
                    {data.expensesByCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatFCFA(v)} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Aucune dépense sur cette période</div>
            )}
          </CardContent>
        </Card>

        {/* Réservations par statut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Réservations par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {data.reservationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.reservationsByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Aucune réservation sur cette période</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recettes par type de chambre */}
      {data.revenueByRoomType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chiffre d'affaires par type de chambre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-muted-foreground">Type</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Nuits</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Chiffre d'affaires</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByRoomType.map((rt, i) => {
                    const total = data.revenueByRoomType.reduce((s, r) => s + r.revenue, 0);
                    const pct = total > 0 ? Math.round((rt.revenue / total) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-2 font-medium">{rt.room_type}</td>
                        <td className="px-3 py-2 text-right">{rt.nights}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatFCFA(rt.revenue)}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top chambres + Top clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 chambres utilisées</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topRooms.length > 0 ? (
              <div className="space-y-2">
                {data.topRooms.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="font-medium">Chambre {r.room_number}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{r.nights} nuits</p>
                      <p className="text-xs text-muted-foreground">{formatFCFA(r.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 clients fréquents</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topGuests.length > 0 ? (
              <div className="space-y-2">
                {data.topGuests.map((g, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="font-medium">{g.guest_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{g.stays} séjour{g.stays > 1 ? "s" : ""}</p>
                      <p className="text-xs text-muted-foreground">{formatFCFA(g.totalPaid)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impayés */}
      {data.unpaid.details.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base">Impayés et paiements partiels</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {data.unpaid.partialPayments} paiement(s) partiel(s) · {data.unpaid.unpaid} impayé(s) · Solde total : {formatFCFA(data.unpaid.totalBalance)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-muted-foreground">Client</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Chambre</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {data.unpaid.details.map((d, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-3 py-2 font-medium">{d.guest_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{d.room_number}</td>
                      <td className="px-3 py-2 text-right">{formatFCFA(d.total)}</td>
                      <td className="px-3 py-2 text-right font-bold text-destructive">{formatFCFA(d.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paiements par méthode */}
      {data.payments.byMethod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paiements reçus par méthode</CardTitle>
            <CardDescription className="text-xs">
              {data.payments.count} paiement(s) · Total : {formatFCFA(data.payments.totalReceived)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-muted-foreground">Méthode</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Nombre</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.byMethod.map((m, i) => {
                    const pct = data.payments.totalReceived > 0 ? Math.round((m.total / data.payments.totalReceived) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-2 font-medium">{m.label}</td>
                        <td className="px-3 py-2 text-right">{m.count}</td>
                        <td className="px-3 py-2 text-right font-medium text-emerald-600">{formatFCFA(m.total)}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
