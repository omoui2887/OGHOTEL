"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Power, Inbox } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { RoomTypeFormDialog } from "./room-type-form-dialog";
import { formatFCFA } from "@/lib/utils";
import type { RoomType } from "@/lib/hotel/room-types";

type Props = {
  roomTypes: RoomType[];
  canEdit: boolean;
};

export function RoomTypesList({ roomTypes, canEdit }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<RoomType | null>(null);
  const [deleting, setDeleting] = React.useState<RoomType | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function toggleActive(rt: RoomType) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/room-types/${rt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !rt.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success(rt.is_active ? "Type désactivé" : "Type activé");
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
      const res = await fetch(`/api/hotel/room-types/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Type supprimé");
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            size="lg"
            className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouveau type de chambre
          </Button>
        </div>
      )}

      {roomTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucun type de chambre
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {canEdit
                ? "Créez votre premier type de chambre pour commencer"
                : "Contactez votre administrateur"}
            </p>
            {canEdit && (
              <Button
                size="lg"
                className="mt-4 bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un type
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt) => (
            <Card
              key={rt.id}
              className={!rt.is_active ? "opacity-60" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base">{rt.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatFCFA(rt.default_price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rt.capacity} personne{rt.capacity > 1 ? "s" : ""} ·{" "}
                      {rt.rooms_count ?? 0} chambre{(rt.rooms_count ?? 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant={rt.is_active ? "default" : "outline"}>
                    {rt.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                {rt.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {rt.description}
                  </p>
                )}

                {canEdit && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditing(rt);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(rt)}
                      disabled={isLoading}
                      title={rt.is_active ? "Désactiver" : "Activer"}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleting(rt)}
                      disabled={isLoading}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RoomTypeFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        roomType={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce type de chambre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le type « {deleting?.name} » ?
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
