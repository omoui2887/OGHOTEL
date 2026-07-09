"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, Inbox, ChevronLeft, ChevronRight,
  BedDouble, Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoomFormDialog } from "./room-form-dialog";
import { cn, formatFCFA } from "@/lib/utils";
import {
  ROOM_STATUS_LABELS, ROOM_STATUS_OPTIONS,
  type Room, type RoomStatus,
} from "@/lib/hotel/rooms";
import type { RoomType } from "@/lib/hotel/room-types";

type Props = {
  rooms: Room[];
  roomTypes: RoomType[];
  canEdit: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  reserved: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  occupied: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  cleaning: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  maintenance: "bg-destructive/15 text-destructive border-destructive/30",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function RoomsList({ rooms, roomTypes, canEdit }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Room | null>(null);
  const [deleting, setDeleting] = React.useState<Room | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  async function handleStatusChange(roomId: string, newStatus: RoomStatus) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Statut mis à jour");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/rooms/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success("Chambre supprimée");
      setDeleting(null);
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  const filteredRooms = statusFilter === "all" ? rooms : rooms.filter((r) => r.status === statusFilter);
  const activeRoomTypes = roomTypes.filter((rt) => rt.is_active);

  return (
    <div className="space-y-4">
      {/* Barre d'actions principale */}
      {canEdit && (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15 text-orange-500">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {rooms.length === 0 ? "Créez vos premières chambres" : "Ajouter une chambre"}
              </p>
              <p className="text-sm text-muted-foreground">
                {rooms.length} chambre(s) · {activeRoomTypes.length} type(s) disponible(s)
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg transition-all hover:scale-105"
            onClick={() => { setEditing(null); setShowForm(true); }}
            disabled={activeRoomTypes.length === 0}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouvelle chambre
          </Button>
        </div>
      )}

      {/* Alerte si pas de types */}
      {canEdit && activeRoomTypes.length === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-700 dark:text-amber-300">
                Aucun type de chambre créé
              </p>
              <p className="text-sm text-muted-foreground">
                Vous devez d'abord créer un type de chambre dans la section "Types de chambres" avant de pouvoir ajouter des chambres.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/app/room-types">Créer un type</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filtre statut */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {ROOM_STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filteredRooms.length} chambre{filteredRooms.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Liste */}
      {filteredRooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <BedDouble className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">Aucune chambre</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {canEdit && activeRoomTypes.length > 0
                ? "Cliquez sur le bouton orange ci-dessus pour créer votre première chambre."
                : canEdit
                ? "Créez d'abord un type de chambre."
                : "Les chambres apparaîtront ici."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room, index) => {
            const statusInfo = ROOM_STATUS_LABELS[room.status];
            return (
              <Card
                key={room.id}
                className="transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        STATUS_COLORS[room.status] ?? "bg-primary/10 text-primary"
                      )}>
                        <BedDouble className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{room.room_number}</p>
                        <p className="text-xs text-muted-foreground">{room.room_type_name ?? "—"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[room.status])}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix/nuit</span>
                      <span className="font-medium">{formatFCFA(room.price_per_night)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacité</span>
                      <span className="font-medium">{room.capacity} pers.</span>
                    </div>
                    {room.floor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Étage</span>
                        <span className="font-medium">{room.floor}</span>
                      </div>
                    )}
                    {room.amenities.length > 0 && (
                      <div className="pt-1">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((a) => (
                            <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                          ))}
                          {room.amenities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{room.amenities.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <>
                      <div className="mt-3">
                        <Select
                          value={room.status}
                          onValueChange={(v) => handleStatusChange(room.id, v as RoomStatus)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOM_STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1 transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30" onClick={() => { setEditing(room); setShowForm(true); }}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />Modifier
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeleting(room)} disabled={isLoading}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RoomFormDialog open={showForm} onOpenChange={setShowForm} room={editing} roomTypes={roomTypes} />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette chambre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la chambre {deleting?.room_number} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
