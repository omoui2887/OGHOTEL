"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Sparkles,
  Inbox,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Eye,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  HOUSEKEEPING_STATUS_LABELS,
  HOUSEKEEPING_STATUS_OPTIONS,
  type HousekeepingTask,
  type HousekeepingStatus,
} from "@/lib/hotel/housekeeping";
import { formatDateTime } from "@/lib/utils";

type Props = {
  tasks: HousekeepingTask[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
  canEdit: boolean;
  rooms: { id: string; room_number: string; status: string }[];
};

export function HousekeepingList({
  tasks,
  total,
  page,
  totalPages,
  initialStatus,
  canEdit,
  rooms,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const updateUrl = React.useCallback(
    (params: { status: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/housekeeping${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    updateUrl({ status: statusFilter, page: 1 });
  }, [statusFilter, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ status: statusFilter, page: p });
  }

  async function handleCreate() {
    if (!selectedRoom) {
      toast.error("Veuillez sélectionner une chambre");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: selectedRoom, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Tâche de ménage créée");
      setShowForm(false);
      setSelectedRoom("");
      setNotes("");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: HousekeepingStatus) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/housekeeping/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      const msg = newStatus === "inspected"
        ? "Chambre inspectée — maintenant disponible"
        : newStatus === "clean"
        ? "Marqué comme propre"
        : "Statut mis à jour";
      toast.success(msg);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtres + bouton */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {HOUSEKEEPING_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {total} tâche{total > 1 ? "s" : ""}
            </span>
          </div>
          {canEdit && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tâche
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune tâche de ménage
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Les tâches sont créées automatiquement après un check-out,
              ou manuellement ici.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const statusInfo = HOUSEKEEPING_STATUS_LABELS[task.status];
            return (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{task.room_number}</span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      {task.room_type_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.room_type_name}
                        </p>
                      )}
                    </div>
                    <Sparkles className="h-5 w-5 text-muted-foreground/40" />
                  </div>

                  {task.assigned_to_name && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Assigné à : <span className="font-medium">{task.assigned_to_name}</span>
                    </p>
                  )}

                  {task.notes && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {formatDateTime(task.created_at)}
                  </p>

                  {/* Actions rapides */}
                  {canEdit && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {task.status === "dirty" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                          disabled={isLoading}
                        >
                          Commencer
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleStatusChange(task.id, "clean")}
                          disabled={isLoading}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Propre
                        </Button>
                      )}
                      {task.status === "clean" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => handleStatusChange(task.id, "inspected")}
                          disabled={isLoading}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Inspecter (disponible)
                        </Button>
                      )}
                      {task.status === "inspected" && (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Chambre disponible
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
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

      {/* Dialog nouvelle tâche */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle tâche de ménage</DialogTitle>
            <DialogDescription>
              Créez une tâche pour une chambre qui doit être nettoyée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Chambre <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une chambre..." />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.room_number} — {r.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hk-notes">Notes (optionnel)</Label>
              <Textarea
                id="hk-notes"
                rows={2}
                placeholder="Ex : Chambre très sale, draps à changer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !selectedRoom}>
                {isLoading ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
