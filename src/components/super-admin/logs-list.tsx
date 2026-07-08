"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Inbox, ChevronLeft, ChevronRight, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ACTION_LABELS, type ActivityLog,
} from "@/lib/super-admin/logs-server";
import { formatDateTime } from "@/lib/utils";

type Props = {
  logs: ActivityLog[];
  total: number;
  page: number;
  totalPages: number;
  initialAction: string;
  initialDateFrom: string;
  initialDateTo: string;
  actions: string[];
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  hotel_admin: "Admin Hôtel",
  manager: "Manager",
  receptionist: "Réceptionniste",
  accountant: "Comptable",
  housekeeping: "Ménage",
  maintenance: "Maintenance",
};

export function LogsList({
  logs, total, page, totalPages,
  initialAction, initialDateFrom, initialDateTo, actions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [action, setAction] = React.useState(initialAction);
  const [dateFrom, setDateFrom] = React.useState(initialDateFrom);
  const [dateTo, setDateTo] = React.useState(initialDateTo);

  const updateUrl = React.useCallback(
    (params: { action: string; dateFrom: string; dateTo: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.action && params.action !== "all") sp.set("action", params.action);
      if (params.dateFrom) sp.set("date_from", params.dateFrom);
      if (params.dateTo) sp.set("date_to", params.dateTo);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/super-admin/logs${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      updateUrl({ action, dateFrom, dateTo, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [action, dateFrom, dateTo, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ action, dateFrom, dateTo, page: p });
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {ACTION_LABELS[a] ?? a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-[150px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-[150px]"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {total} entrée{total > 1 ? "s" : ""}
          </span>
        </CardContent>
      </Card>

      {/* Liste */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ScrollText className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune activité enregistrée
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Les actions importantes apparaîtront ici automatiquement
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {logs.map((log) => {
                const label = ACTION_LABELS[log.action] ?? log.action;
                const meta = log.metadata as any;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/20"
                  >
                    {/* Point coloré */}
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{label}</p>
                        {log.user_role && (
                          <Badge variant="outline" className="text-xs">
                            {ROLE_LABELS[log.user_role] ?? log.user_role}
                          </Badge>
                        )}
                        {log.establishment_name && (
                          <Badge variant="secondary" className="text-xs">
                            {log.establishment_name}
                          </Badge>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {log.user_name ?? log.user_email ?? "Système"}
                        {meta?.old_status && meta?.new_status && (
                          <span> · {meta.old_status} → {meta.new_status}</span>
                        )}
                        {meta?.amount && (
                          <span> · {meta.amount} FCFA</span>
                        )}
                        {meta?.code && (
                          <span> · Code : {meta.code}</span>
                        )}
                        {meta?.invoice_number && (
                          <span> · {meta.invoice_number}</span>
                        )}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
