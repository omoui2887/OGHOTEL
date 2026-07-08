"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Wrench,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_STATUS_OPTIONS,
  type MaintenanceTicket,
  type MaintenancePriority,
  type MaintenanceStatus,
} from "@/lib/hotel/maintenance";
import { formatFCFA, formatDateTime } from "@/lib/utils";

type Props = {
  tickets: MaintenanceTicket[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
  initialPriority: string;
  canEdit: boolean;
  rooms: { id: string; room_number: string; status: string }[];
};

export function MaintenanceList({
  tickets,
  total,
  page,
  totalPages,
  initialStatus,
  initialPriority,
  canEdit,
  rooms,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = React.useState(initialPriority);
  const [showForm, setShowForm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [formTitle, setFormTitle] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formPriority, setFormPriority] = React.useState<MaintenancePriority>("normal");
  const [formRoom, setFormRoom] = React.useState("");
  const [formCost, setFormCost] = React.useState("");
  const [formSetRoomMaintenance, setFormSetRoomMaintenance] = React.useState(false);

  const updateUrl = React.useCallback(
    (params: { status: string; priority: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.priority && params.priority !== "all") sp.set("priority", params.priority);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/maintenance${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    updateUrl({ status: statusFilter, priority: priorityFilter, page: 1 });
  }, [statusFilter, priorityFilter, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ status: statusFilter, priority: priorityFilter, page: p });
  }

  function resetForm() {
    setFormTitle("");
    setFormDesc("");
    setFormPriority("normal");
    setFormRoom("");
    setFormCost("");
    setFormSetRoomMaintenance(false);
  }

  async function handleCreate() {
    if (!formTitle.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc || undefined,
          priority: formPriority,
          room_id: formRoom || null,
          cost: formCost ? Number(formCost) : undefined,
          set_room_maintenance: formSetRoomMaintenance,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Ticket de maintenance créé");
      setShowForm(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(ticketId: string, newStatus: MaintenanceStatus) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/maintenance/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success(
        newStatus === "resolved"
          ? "Ticket résolu — chambre remise en disponible"
          : "Statut mis à jour"
      );
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
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                {MAINTENANCE_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {total} ticket{total > 1 ? "s" : ""}
            </span>
          </div>
          {canEdit && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Signaler incident
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Wrench className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucun ticket de maintenance
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Signalez un incident ou une réparation nécessaire.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const statusInfo = MAINTENANCE_STATUS_LABELS[t.status];
            const priorityInfo = PRIORITY_LABELS[t.priority];
            return (
              <Card key={t.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{t.title}</p>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {t.room_number && <span>Chambre {t.room_number}</span>}
                      {t.cost > 0 && <span>Coût : {formatFCFA(t.cost)}</span>}
                      {t.assigned_to_name && <span>Responsable : {t.assigned_to_name}</span>}
                      <span>{formatDateTime(t.created_at)}</span>
                    </div>
                    {t.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {t.description}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 shrink-0">
                      {t.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(t.id, "in_progress")}
                          disabled={isLoading}
                        >
                          Prendre en charge
                        </Button>
                      )}
                      {t.status === "in_progress" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(t.id, "resolved")}
                          disabled={isLoading}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Résoudre
                        </Button>
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

      {/* Dialog nouveau ticket */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Signaler un incident</DialogTitle>
            <DialogDescription>
              Déclarez un problème technique ou une réparation nécessaire.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mt-title">
                Titre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mt-title"
                placeholder="Ex : Climatisation ne fonctionne plus"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mt-desc">Description</Label>
              <Textarea
                id="mt-desc"
                rows={3}
                placeholder="Détails de l'incident..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select
                  value={formPriority}
                  onValueChange={(v) => setFormPriority(v as MaintenancePriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mt-cost">Coût estimé (FCFA)</Label>
                <Input
                  id="mt-cost"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0"
                  value={formCost}
                  onChange={(e) => setFormCost(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Chambre concernée (optionnel)</Label>
              <Select value={formRoom} onValueChange={setFormRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Incident général ou sélectionnez une chambre..." />
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

            {formRoom && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
                <Checkbox
                  id="set-maintenance"
                  checked={formSetRoomMaintenance}
                  onCheckedChange={(v) => setFormSetRoomMaintenance(v === true)}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="set-maintenance" className="text-sm font-medium cursor-pointer">
                    Passer la chambre en maintenance
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    La chambre sera indisponible à la réservation jusqu'à résolution du ticket.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !formTitle.trim()}>
                {isLoading ? "Création..." : "Créer le ticket"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
