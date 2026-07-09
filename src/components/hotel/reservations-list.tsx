"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Zap,
  CalendarPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_OPTIONS,
  RESERVATION_SOURCE_LABELS,
  type Reservation,
} from "@/lib/hotel/reservations";
import { formatFCFA, formatDate } from "@/lib/utils";
import { ReservationWizardDialog } from "@/components/hotel/reservation-wizard-dialog";
import type { Room } from "@/lib/hotel/rooms";
import type { Guest } from "@/lib/hotel/guests";

type Props = {
  reservations: Reservation[];
  total: number;
  page: number;
  totalPages: number;
  rooms: Room[];
  guests: Guest[];
  initialSearch: string;
  initialStatus: string;
  initialRoomId: string;
  canEdit: boolean;
};

export function ReservationsList({
  reservations,
  total,
  page,
  totalPages,
  rooms,
  guests,
  initialSearch,
  initialStatus,
  initialRoomId,
  canEdit,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);
  const [roomId, setRoomId] = React.useState(initialRoomId);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardMode, setWizardMode] = React.useState<"reservation" | "walk-in">("reservation");

  // Auto-open wizard si ?new=1 ou ?walkin=1 dans l'URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") {
      setWizardMode("reservation");
      setWizardOpen(true);
      params.delete("new");
      const qs = params.toString();
      window.history.replaceState({}, "", `/app/reservations${qs ? "?" + qs : ""}`);
    } else if (params.get("walkin") === "1") {
      setWizardMode("walk-in");
      setWizardOpen(true);
      params.delete("walkin");
      const qs = params.toString();
      window.history.replaceState({}, "", `/app/reservations${qs ? "?" + qs : ""}`);
    }
  }, []);

  const updateUrl = React.useCallback(
    (params: { search: string; status: string; roomId: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.roomId && params.roomId !== "all") sp.set("room_id", params.roomId);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/reservations${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  // Debounce recherche
  React.useEffect(() => {
    const t = setTimeout(() => {
      updateUrl({ search, status, roomId, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [search, status, roomId, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ search, status, roomId, page: p });
  }

  const hasFilters = search || status !== "all" || roomId !== "all";

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {RESERVATION_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes chambres</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.room_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {total} réservation{total > 1 ? "s" : ""}
            </span>
            {canEdit && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setWizardMode("walk-in");
                    setWizardOpen(true);
                  }}
                  className="border-orange-500/40 text-orange-600 hover:bg-orange-500/5"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Walk-In
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setWizardMode("reservation");
                    setWizardOpen(true);
                  }}
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Nouvelle Réservation
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune réservation trouvée
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {hasFilters
                ? "Essayez de modifier vos filtres"
                : canEdit
                ? "Créez votre première réservation"
                : "Les réservations apparaîtront ici"}
            </p>
            {canEdit && !hasFilters && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setWizardMode("walk-in");
                    setWizardOpen(true);
                  }}
                  className="border-orange-500/40 text-orange-600 hover:bg-orange-500/5"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Enregistrement Walk-In
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setWizardMode("reservation");
                    setWizardOpen(true);
                  }}
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Créer une réservation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Chambre</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Arrivée</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Départ</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nuits</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Solde</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => {
                    const statusInfo = RESERVATION_STATUS_LABELS[r.status];
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/app/guests/${r.guest_id}`}
                            className="font-medium hover:text-primary"
                          >
                            {r.guest_name ?? "—"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{r.guest_phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{r.room_number ?? "—"}</span>
                          {r.room_type_name && (
                            <p className="text-xs text-muted-foreground">{r.room_type_name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(r.check_in_date)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(r.check_out_date)}
                        </td>
                        <td className="px-4 py-3 text-center">{r.nights}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatFCFA(r.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          {r.balance_amount > 0 ? (
                            <span className="text-destructive font-medium">
                              {formatFCFA(r.balance_amount)}
                            </span>
                          ) : (
                            <Badge variant="success" className="text-xs">
                              Payé
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/app/reservations/${r.id}`} aria-label="Voir">
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

      {/* Modale Wizard Réservation / Walk-In */}
      {canEdit && (
        <ReservationWizardDialog
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          mode={wizardMode}
          rooms={rooms}
          guests={guests}
        />
      )}
    </div>
  );
}
