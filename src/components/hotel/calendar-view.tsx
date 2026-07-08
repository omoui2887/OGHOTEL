"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogIn,
  LogOut,
  LayoutGrid,
  CalendarDays,
  CalendarRange,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/hotel/reservations";
import { formatFCFA, cn } from "@/lib/utils";
import type {
  CalendarRoom,
  CalendarReservation,
} from "@/lib/hotel/calendar-server";

type ViewMode = "day" | "week" | "month" | "planning";

type Props = {
  rooms: CalendarRoom[];
  reservations: CalendarReservation[];
  arrivals: CalendarReservation[];
  departures: CalendarReservation[];
  roomTypes: { id: string; name: string }[];
  initialDate: string; // YYYY-MM-DD
  canEdit: boolean;
};

// Couleurs par statut de réservation
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  confirmed: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  checked_in: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  checked_out: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

// Couleurs par statut de chambre
const ROOM_STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-600",
  reserved: "bg-blue-500/15 text-blue-600",
  occupied: "bg-primary/15 text-primary",
  cleaning: "bg-amber-500/15 text-amber-600",
  maintenance: "bg-destructive/15 text-destructive",
  inactive: "bg-muted text-muted-foreground",
};

const ROOM_STATUS_LABELS: Record<string, string> = {
  available: "Libre",
  reserved: "Réservée",
  occupied: "Occupée",
  cleaning: "Nettoyage",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z");
}

function formatDateISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return formatDateISO(d1) === formatDateISO(d2);
}

export function CalendarView({
  rooms,
  reservations,
  arrivals,
  departures,
  roomTypes,
  initialDate,
  canEdit,
}: Props) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = React.useState(parseDate(initialDate));
  const [roomTypeFilter, setRoomTypeFilter] = React.useState("all");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtrer les chambres par type
  const filteredRooms = React.useMemo(() => {
    if (roomTypeFilter === "all") return rooms;
    return rooms.filter((r) => {
      // On n'a pas room_type_id dans CalendarRoom, on filtre par nom
      const rt = roomTypes.find((t) => t.id === roomTypeFilter);
      return rt && r.room_type_name === rt.name;
    });
  }, [rooms, roomTypeFilter, roomTypes]);

  // Construire un map des réservations par room_id
  const reservationsByRoom = React.useMemo(() => {
    const map = new Map<string, CalendarReservation[]>();
    reservations.forEach((r) => {
      if (!map.has(r.room_id)) map.set(r.room_id, []);
      map.get(r.room_id)!.push(r);
    });
    return map;
  }, [reservations]);

  // Navigation
  function navigate(direction: "prev" | "next" | "today") {
    if (direction === "today") {
      setCurrentDate(today);
      return;
    }
    const multiplier = direction === "next" ? 1 : -1;
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, multiplier));
    } else if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, multiplier * 7));
    } else if (viewMode === "month") {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + multiplier);
      setCurrentDate(d);
    } else if (viewMode === "planning") {
      setCurrentDate(addDays(currentDate, multiplier * 7));
    }
  }

  // Titre de la période
  function getPeriodTitle(): string {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "week" || viewMode === "planning") {
      const monday = getMonday(currentDate);
      const sunday = addDays(monday, 6);
      return `${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    } else {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  }

  // Obtenir les réservations pour un jour et une chambre spécifiques
  function getReservationsForDay(roomId: string, date: Date): CalendarReservation[] {
    const roomResas = reservationsByRoom.get(roomId) ?? [];
    const dateStr = formatDateISO(date);
    return roomResas.filter((r) => {
      const checkIn = r.check_in_date;
      const checkOut = r.check_out_date;
      // Le client est dans la chambre si check_in <= date < check_out
      return checkIn <= dateStr && dateStr < checkOut;
    });
  }

  // Vérifier si une date est dans le mois courant (vue mois)
  function isCurrentMonth(d: Date): boolean {
    return d.getMonth() === currentDate.getMonth();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("today")}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="ml-2 text-sm font-semibold capitalize">{getPeriodTitle()}</h2>
          </div>

          {/* Sélecteurs */}
          <div className="flex items-center gap-2">
            {/* Filtre type de chambre */}
            <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {roomTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode de vue */}
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className="h-8"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className="h-8"
              >
                <CalendarRange className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className="h-8"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "planning" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("planning")}
                className="h-8"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {canEdit && (
              <Button asChild size="sm">
                <Link href="/app/reservations/new">
                  <Plus className="mr-1 h-4 w-4" />
                  Réservation
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Arrivées / Départs du jour (visible en mode jour et semaine) */}
      {(viewMode === "day" || viewMode === "week") && (arrivals.length > 0 || departures.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {arrivals.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold">
                    Arrivées du jour ({arrivals.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {arrivals.map((r) => (
                    <Link
                      key={r.id}
                      href={`/app/reservations/${r.id}`}
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm transition-colors hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{r.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.nights} nuit{r.nights > 1 ? "s" : ""} · {formatFCFA(r.total_amount)}
                        </p>
                      </div>
                      {r.balance_amount > 0 && (
                        <Badge variant="warning" className="text-xs">
                          Solde {formatFCFA(r.balance_amount)}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {departures.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold">
                    Départs du jour ({departures.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {departures.map((r) => (
                    <Link
                      key={r.id}
                      href={`/app/reservations/${r.id}`}
                      className="flex items-center justify-between rounded-md border border-border p-2 text-sm transition-colors hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{r.guest_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.nights} nuit{r.nights > 1 ? "s" : ""} · {formatFCFA(r.total_amount)}
                        </p>
                      </div>
                      {r.balance_amount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          Solde {formatFCFA(r.balance_amount)}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-muted-foreground">Légende :</span>
        {Object.entries(STATUS_COLORS).map(([status, colors]) => {
          const label = RESERVATION_STATUS_LABELS[status as ReservationStatus];
          if (!label) return null;
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded", colors.dot)} />
              <span>{label.label}</span>
            </div>
          );
        })}
      </div>

      {/* Vue JOUR */}
      {viewMode === "day" && (
        <Card>
          <CardContent className="p-0">
            {filteredRooms.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Aucune chambre à afficher
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredRooms.map((room) => {
                  const dayReservations = getReservationsForDay(room.id, currentDate);
                  return (
                    <div
                      key={room.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/20"
                    >
                      {/* Numéro chambre + statut */}
                      <div className="flex w-28 shrink-0 flex-col gap-1">
                        <span className="font-bold">{room.room_number}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs font-medium",
                            ROOM_STATUS_COLORS[room.status]
                          )}
                        >
                          {ROOM_STATUS_LABELS[room.status] ?? room.status}
                        </span>
                        {room.room_type_name && (
                          <span className="text-xs text-muted-foreground">
                            {room.room_type_name}
                          </span>
                        )}
                      </div>

                      {/* Réservations du jour */}
                      <div className="flex-1">
                        {dayReservations.length === 0 ? (
                          <span className="text-sm text-muted-foreground italic">
                            Disponible
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {dayReservations.map((r) => {
                              const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.confirmed;
                              const isCheckInDay = r.check_in_date === formatDateISO(currentDate);
                              const isCheckOutDay = r.check_out_date === formatDateISO(addDays(currentDate, 1));
                              return (
                                <Link
                                  key={r.id}
                                  href={`/app/reservations/${r.id}`}
                                  className={cn(
                                    "block rounded-md border px-3 py-1.5 text-sm transition-colors hover:opacity-80",
                                    colors.bg,
                                    colors.border,
                                    colors.text
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-medium">{r.guest_name}</span>
                                      {isCheckInDay && (
                                        <span className="ml-2 text-xs font-normal">← Arrivée</span>
                                      )}
                                      {isCheckOutDay && (
                                        <span className="ml-2 text-xs font-normal">→ Départ demain</span>
                                      )}
                                    </div>
                                    <span className="text-xs">
                                      {r.check_in_date} → {r.check_out_date}
                                    </span>
                                  </div>
                                  {r.balance_amount > 0 && (
                                    <p className="text-xs mt-0.5">
                                      Solde : {formatFCFA(r.balance_amount)}
                                    </p>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vue SEMAINE */}
      {viewMode === "week" && (
        <Card>
          <CardContent className="p-0">
            {filteredRooms.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Aucune chambre à afficher
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="sticky left-0 z-10 w-28 border-r border-border bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground">
                        Chambre
                      </th>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const day = addDays(getMonday(currentDate), i);
                        const isToday = isSameDay(day, today);
                        return (
                          <th
                            key={i}
                            className={cn(
                              "border-r border-border px-2 py-2 text-center font-medium",
                              isToday && "bg-primary/10"
                            )}
                          >
                            <div className="text-xs text-muted-foreground">{WEEKDAYS[i]}</div>
                            <div className={cn("text-sm", isToday && "font-bold text-primary")}>
                              {day.getDate()}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => (
                      <tr key={room.id} className="border-b border-border/50">
                        <td className="sticky left-0 z-10 w-28 border-r border-border bg-background px-3 py-1">
                          <div className="font-bold text-sm">{room.room_number}</div>
                          <div className="text-xs text-muted-foreground">{room.room_type_name}</div>
                        </td>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const day = addDays(getMonday(currentDate), i);
                          const dayReservations = getReservationsForDay(room.id, day);
                          const isToday = isSameDay(day, today);
                          return (
                            <td
                              key={i}
                              className={cn(
                                "border-r border-border p-1 align-top",
                                isToday && "bg-primary/5"
                              )}
                            >
                              {dayReservations.map((r) => {
                                const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.confirmed;
                                const isCheckInDay = r.check_in_date === formatDateISO(day);
                                return (
                                  <Link
                                    key={r.id}
                                    href={`/app/reservations/${r.id}`}
                                    className={cn(
                                      "mb-1 block rounded px-1.5 py-1 text-xs transition-colors hover:opacity-80",
                                      colors.bg,
                                      colors.border,
                                      colors.text
                                    )}
                                    title={`${r.guest_name} — ${r.check_in_date} → ${r.check_out_date}`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                                      <span className="truncate font-medium">
                                        {r.guest_name}
                                      </span>
                                    </div>
                                    {isCheckInDay && (
                                      <span className="text-xs opacity-80">← {formatFCFA(r.total_amount)}</span>
                                    )}
                                  </Link>
                                );
                              })}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vue MOIS */}
      {viewMode === "month" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {WEEKDAYS.map((day) => (
                      <th
                        key={day}
                        className="border-r border-border px-2 py-2 text-center font-medium text-muted-foreground"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const startDate = getMonday(firstDay);
                    const weeks: Date[][] = [];
                    for (let w = 0; w < 6; w++) {
                      const week: Date[] = [];
                      for (let d = 0; d < 7; d++) {
                        week.push(addDays(startDate, w * 7 + d));
                      }
                      weeks.push(week);
                    }
                    return weeks.map((week, wi) => (
                      <tr key={wi} className="border-b border-border/50">
                        {week.map((day, di) => {
                          const isToday = isSameDay(day, today);
                          const inMonth = isCurrentMonth(day);
                          // Compter les réservations du jour (toutes chambres)
                          const dayReservations = reservations.filter((r) => {
                            return r.check_in_date <= formatDateISO(day) && formatDateISO(day) < r.check_out_date;
                          });
                          const arrivalsCount = reservations.filter(
                            (r) => r.check_in_date === formatDateISO(day)
                          ).length;
                          const departuresCount = reservations.filter(
                            (r) => r.check_out_date === formatDateISO(addDays(day, 1))
                          ).length;

                          return (
                            <td
                              key={di}
                              className={cn(
                                "border-r border-border p-1 align-top h-24 min-w-[100px]",
                                !inMonth && "bg-muted/20",
                                isToday && "bg-primary/5"
                              )}
                            >
                              <div
                                className={cn(
                                  "mb-1 text-xs font-medium",
                                  !inMonth && "text-muted-foreground/50",
                                  isToday && "text-primary"
                                )}
                              >
                                {day.getDate()}
                              </div>
                              <div className="space-y-0.5">
                                {dayReservations.slice(0, 3).map((r) => {
                                  const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.confirmed;
                                  const room = rooms.find((rm) => rm.id === r.room_id);
                                  return (
                                    <Link
                                      key={r.id}
                                      href={`/app/reservations/${r.id}`}
                                      className={cn(
                                        "block truncate rounded px-1 py-0.5 text-xs transition-colors hover:opacity-80",
                                        colors.bg,
                                        colors.text
                                      )}
                                      title={`${r.guest_name} — Ch ${room?.room_number}`}
                                    >
                                      <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", colors.dot)} />
                                      {room?.room_number} · {r.guest_name}
                                    </Link>
                                  );
                                })}
                                {dayReservations.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{dayReservations.length - 3} autre{dayReservations.length - 3 > 1 ? "s" : ""}
                                  </p>
                                )}
                                {arrivalsCount > 0 && (
                                  <p className="text-xs text-emerald-600">
                                    ← {arrivalsCount} arrivée{arrivalsCount > 1 ? "s" : ""}
                                  </p>
                                )}
                                {departuresCount > 0 && (
                                  <p className="text-xs text-blue-600">
                                    → {departuresCount} départ{departuresCount > 1 ? "s" : ""}
                                  </p>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vue PLANNING par chambre (Gantt simplifié) */}
      {viewMode === "planning" && (
        <Card>
          <CardContent className="p-0">
            {filteredRooms.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Aucune chambre à afficher
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="sticky left-0 z-10 w-28 border-r border-border bg-muted/30 px-3 py-2 text-left font-medium text-muted-foreground">
                        Chambre
                      </th>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const day = addDays(getMonday(currentDate), i);
                        const isToday = isSameDay(day, today);
                        return (
                          <th
                            key={i}
                            className={cn(
                              "border-r border-border px-2 py-2 text-center font-medium min-w-[120px]",
                              isToday && "bg-primary/10"
                            )}
                          >
                            <div className="text-xs text-muted-foreground">{WEEKDAYS[i]}</div>
                            <div className={cn("text-sm", isToday && "font-bold text-primary")}>
                              {day.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map((room) => {
                      const roomReservations = reservationsByRoom.get(room.id) ?? [];
                      return (
                        <tr key={room.id} className="border-b border-border/50 h-16">
                          <td className="sticky left-0 z-10 w-28 border-r border-border bg-background px-3 py-1">
                            <div className="font-bold text-sm">{room.room_number}</div>
                            <div className="text-xs text-muted-foreground">{room.room_type_name}</div>
                            <span
                              className={cn(
                                "mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs font-medium",
                                ROOM_STATUS_COLORS[room.status]
                              )}
                            >
                              {ROOM_STATUS_LABELS[room.status] ?? room.status}
                            </span>
                          </td>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const day = addDays(getMonday(currentDate), i);
                            const dayReservations = getReservationsForDay(room.id, day);
                            const isToday = isSameDay(day, today);
                            return (
                              <td
                                key={i}
                                className={cn(
                                  "border-r border-border p-1 align-top",
                                  isToday && "bg-primary/5"
                                )}
                              >
                                {dayReservations.map((r) => {
                                  const colors = STATUS_COLORS[r.status] ?? STATUS_COLORS.confirmed;
                                  const isCheckInDay = r.check_in_date === formatDateISO(day);
                                  const isCheckOutTomorrow =
                                    r.check_out_date === formatDateISO(addDays(day, 1));
                                  return (
                                    <Link
                                      key={r.id}
                                      href={`/app/reservations/${r.id}`}
                                      className={cn(
                                        "mb-1 block rounded-md border px-2 py-1 text-xs transition-colors hover:opacity-80",
                                        colors.bg,
                                        colors.border,
                                        colors.text
                                      )}
                                    >
                                      <div className="font-medium truncate">{r.guest_name}</div>
                                      <div className="flex items-center justify-between mt-0.5">
                                        <span className="opacity-80">
                                          {isCheckInDay && "← "}
                                          {isCheckOutTomorrow && "→ "}
                                          {r.nights}n
                                        </span>
                                        {r.balance_amount > 0 && (
                                          <span className="font-medium">
                                            {formatFCFA(r.balance_amount)}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
