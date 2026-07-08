"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Eye, Pencil, Trash2, Inbox, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { GuestFormDialog } from "./guest-form-dialog";
import { ID_TYPE_LABELS, type Guest } from "@/lib/hotel/guests";
import { formatDate } from "@/lib/utils";

type Props = {
  guests: Guest[];
  total: number;
  page: number;
  totalPages: number;
  canEdit: boolean;
  initialSearch: string;
};

export function GuestsList({
  guests,
  total,
  page,
  totalPages,
  canEdit,
  initialSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(initialSearch);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Guest | null>(null);
  const [deleting, setDeleting] = React.useState<Guest | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Debounce recherche
  React.useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (search) {
        sp.set("search", search);
      } else {
        sp.delete("search");
      }
      sp.delete("page");
      const qs = sp.toString();
      router.push(`/app/guests${qs ? "?" + qs : ""}`);
    }, 350);
    return () => clearTimeout(t);
  }, [search, router, searchParams]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    router.push(`/app/guests${qs ? "?" + qs : ""}`);
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/guests/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Client supprimé");
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  const hasFilters = !!search;

  return (
    <div className="space-y-4">
      {/* Barre de recherche + bouton */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher (nom, téléphone, email, n° pièce)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {total} client{total > 1 ? "s" : ""}
            </span>
            {canEdit && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      {guests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucun client trouvé
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {hasFilters
                ? "Essayez de modifier votre recherche"
                : canEdit
                ? "Créez votre premier client"
                : "Les clients apparaîtront ici"}
            </p>
            {canEdit && !hasFilters && (
              <Button
                className="mt-4"
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un client
              </Button>
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
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nom</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Téléphone</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Nationalité</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Pièce</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Créé le</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/app/guests/${guest.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {guest.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{guest.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {guest.email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {guest.nationality ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {guest.id_type ? (
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {ID_TYPE_LABELS[guest.id_type] ?? guest.id_type}
                            </Badge>
                            {guest.id_number && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {guest.id_number}
                              </p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(guest.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/app/guests/${guest.id}`} aria-label="Voir">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditing(guest);
                                  setShowForm(true);
                                }}
                                aria-label="Modifier"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setDeleting(guest)}
                                aria-label="Supprimer"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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

      <GuestFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        guest={editing}
      />

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer « {deleting?.full_name} » ?
              Cette action est irréversible. Le client ne pourra pas être supprimé
              s'il a des réservations.
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
