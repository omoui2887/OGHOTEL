"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Inbox, BedDouble } from "lucide-react";
import { toast } from "sonner";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RoomFormDialog } from "./room-form-dialog";
import { formatFCFA } from "@/lib/utils";
import {
  ROOM_STATUS_LABELS,
  ROOM_STATUS_OPTIONS,
  type Room,
  type RoomStatus,
} from "@/lib/hotel/rooms";
import type { RoomType } from "@/lib/hotel/room-types";

type Props = {
  rooms: Room[];
  roomTypes: RoomType[];
  canEdit: boolean;
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
      const res = await fetch(`/api/hotel/rooms/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Chambre supprimée");
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRooms =
    statusFilter === "all"
      ? rooms
      : rooms.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-4">
      {/* Header avec filtre + bouton */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {ROOM_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {filteredRooms.length} chambre{filteredRooms.length > 1 ? "s" : ""}
            </span>
          </div>
          {canEdit && (
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle chambre
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste */}
      {filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune chambre
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {canEdit
                ? "Créez votre première chambre pour commencer"
                : "Contactez votre administrateur"}
            </p>
            {canEdit && roomTypes.length > 0 && (
              <Button
                className="mt-4"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une chambre
              </Button>
            )}
            {canEdit && roomTypes.length === 0 && (
              <p className="mt-3 text-xs text-amber-500">
                Créez d'abord un type de chambre dans /app/room-types
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRooms.map((room) => {
            const statusInfo = ROOM_STATUS_LABELS[room.status];
            return (
              <Card key={room.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BedDouble className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{room.room_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.room_type_name ?? "—"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
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
                        <p className="text-xs text-muted-foreground mb-1">Équipements</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 4).map((a) => (
                            <Badge key={a} variant="outline" className="text-xs">
                              {a}
                            </Badge>
                          ))}
                          {room.amenities.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{room.amenities.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Changement rapide de statut */}
                  {canEdit && (
                    <div className="mt-3">
                      <Select
                        value={room.status}
                        onValueChange={(v) =>
                          handleStatusChange(room.id, v as RoomStatus)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROOM_STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditing(room);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleting(room)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <RoomFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        room={editing}
        roomTypes={roomTypes}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette chambre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la chambre {deleting?.room_number} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
