"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Power, Inbox, Loader2 } from "lucide-react";
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
import { formatFCFA, cn } from "@/lib/utils";
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
      {/* Bouton prominent - toujours visible */}
      {canEdit && (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div>
            <p className="font-semibold text-foreground">
              {roomTypes.length === 0
                ? "Commencez par créer un type de chambre"
                : "Ajouter un nouveau type"}
            </p>
            <p className="text-sm text-muted-foreground">
              {roomTypes.length === 0
                ? "Vous devez créer au moins un type (Simple, Double, Suite...) avant de pouvoir ajouter des chambres."
                : `${roomTypes.length} type(s) de chambre créé(s)`}
            </p>
          </div>
          <Button
            size="lg"
            className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg transition-all hover:scale-105"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouveau type
          </Button>
        </div>
      )}

      {/* État vide */}
      {roomTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Aucun type de chambre créé
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {canEdit
                ? "Cliquez sur le bouton orange ci-dessus pour créer votre premier type de chambre (ex : Simple, Double, Suite...)."
                : "Contactez votre administrateur pour créer des types de chambres."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt, index) => (
            <Card
              key={rt.id}
              className={cn(
                "transition-all hover:shadow-lg hover:-translate-y-0.5",
                !rt.is_active && "opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base">{rt.name}</h3>
                    <p className="mt-1 text-2xl font-bold text-orange-500">
                      {formatFCFA(rt.default_price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rt.capacity} personne{rt.capacity > 1 ? "s" : ""}
                      {rt.rooms_count !== undefined && (
                        <> · {rt.rooms_count} chambre{rt.rooms_count > 1 ? "s" : ""}</>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={rt.is_active ? "default" : "outline"}
                    className={rt.is_active
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : ""
                    }
                  >
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
                      className="flex-1 transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
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
                      className="transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleting(rt)}
                      disabled={isLoading}
                      title="Supprimer"
                      className="transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
