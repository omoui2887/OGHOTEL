"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  LEAD_STATUS_LABELS,
  getBusinessTypeLabel,
} from "@/lib/super-admin/leads";
import { buildWhatsAppUrl } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import type { Lead } from "@/lib/super-admin/leads";

type LeadsTableProps = {
  initialLeads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  cities: string[];
  plans: { id: string; name: string }[];
  initialFilters: {
    search: string;
    status: string;
    city: string;
    plan_id: string;
  };
};

export function LeadsTable({
  initialLeads,
  total,
  page,
  pageSize,
  totalPages,
  cities,
  plans,
  initialFilters,
}: LeadsTableProps) {
  const router = useRouter();
  const isFirstRender = React.useRef(true);

  const [search, setSearch] = React.useState(initialFilters.search);
  const [status, setStatus] = React.useState(initialFilters.status);
  const [city, setCity] = React.useState(initialFilters.city);
  const [planId, setPlanId] = React.useState(initialFilters.plan_id);

  const updateUrl = React.useCallback(
    (params: {
      search: string;
      status: string;
      city: string;
      plan_id: string;
      page: number;
    }) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.city && params.city !== "all") sp.set("city", params.city);
      if (params.plan_id && params.plan_id !== "all") sp.set("plan_id", params.plan_id);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/super-admin/leads${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  // Debounce pour la recherche — on saute le premier render pour éviter
  // un router.push inutile au montage (qui provoquerait un re-fetch serveur).
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      updateUrl({ search, status, city, plan_id: planId, page: 1 });
    }, 350);
    return () => clearTimeout(t);
  }, [search, status, city, planId, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ search, status, city, plan_id: planId, page: p });
  }

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setCity("all");
    setPlanId("all");
    router.push("/super-admin/leads");
  }

  const hasFilters =
    search || status !== "all" || city !== "all" || planId !== "all";

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {/* Recherche */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher (nom, structure, email, téléphone)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Statut */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(LEAD_STATUS_LABELS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ville */}
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les villes</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Formule */}
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder="Formule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formules</SelectItem>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          {hasFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {total} prospect{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
              </p>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-3.5 w-3.5" />
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {initialLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Aucun prospect trouvé
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {hasFilters
                  ? "Essayez de modifier vos filtres"
                  : "Les prospects qui remplissent le formulaire apparaîtront ici"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Prospect</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Structure</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Ville</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Formule</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialLeads.map((lead) => {
                      const statusInfo = LEAD_STATUS_LABELS[lead.status] ?? {
                        label: lead.status,
                        variant: "outline" as const,
                      };
                      return (
                        <tr
                          key={lead.id}
                          className="border-b border-border/50 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium">{lead.full_name}</div>
                            <div className="text-xs text-muted-foreground">{lead.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{lead.business_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {getBusinessTypeLabel(lead.business_type)}
                              {lead.rooms_count ? ` · ${lead.rooms_count} ch.` : ""}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {lead.city ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {lead.desired_plan_name ? (
                              <Badge variant="outline">{lead.desired_plan_name}</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a
                                  href={buildWhatsAppUrl(
                                    lead.phone,
                                    `Bonjour ${lead.full_name}, je vous contacte concernant votre demande pour ${APP_NAME}.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                                </a>
                              </Button>
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <a href={`tel:${lead.phone}`} aria-label="Appeler">
                                  <Phone className="h-4 w-4 text-blue-500" />
                                </a>
                              </Button>
                              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                <Link href={`/super-admin/leads/${lead.id}`} aria-label="Voir détail">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-2 p-3 md:hidden">
                {initialLeads.map((lead) => {
                  const statusInfo = LEAD_STATUS_LABELS[lead.status] ?? {
                    label: lead.status,
                    variant: "outline" as const,
                  };
                  return (
                    <div key={lead.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{lead.full_name}</p>
                          <p className="text-xs text-muted-foreground">{lead.business_name}</p>
                          <p className="text-xs text-muted-foreground">{lead.phone}</p>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {lead.city ?? "—"} · {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        <div className="flex gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <a
                              href={buildWhatsAppUrl(
                                lead.phone,
                                `Bonjour ${lead.full_name}, je vous contacte concernant votre demande pour ${APP_NAME}.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-4 w-4 text-emerald-500" />
                            </a>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/super-admin/leads/${lead.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages} · {total} prospect{total > 1 ? "s" : ""}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
