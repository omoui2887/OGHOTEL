"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, X, Inbox, Check, Ban, Ticket } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_OPTIONS,
  type SaaSPayment,
} from "@/lib/super-admin/payments";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { PaymentFormDialog } from "./payment-form-dialog";

type PaymentsListProps = {
  payments: SaaSPayment[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
  leads: { id: string; full_name: string; business_name: string }[];
  establishments: { id: string; name: string; owner_name: string | null }[];
  plans: { id: string; name: string; price_fcfa: number }[];
};

export function PaymentsList({
  payments,
  total,
  page,
  totalPages,
  initialStatus,
  leads,
  establishments,
  plans,
}: PaymentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = React.useRef(true);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [showForm, setShowForm] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);

  // Debounce pour le filtre statut — on saute le premier render pour éviter
  // un router.push inutile au montage (qui provoquerait un re-fetch serveur).
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (statusFilter && statusFilter !== "all") {
        sp.set("status", statusFilter);
      } else {
        sp.delete("status");
      }
      sp.delete("page");
      const qs = sp.toString();
      router.push(`/super-admin/payments${qs ? "?" + qs : ""}`);
    }, 400);
    return () => clearTimeout(t);
  }, [statusFilter, router, searchParams]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    router.push(`/super-admin/payments${qs ? "?" + qs : ""}`);
  }

  async function handleAction(
    paymentId: string,
    action: "validate" | "reject" | "generate"
  ) {
    setActionLoading(`${paymentId}-${action}`);
    try {
      if (action === "generate") {
        const res = await fetch("/api/super-admin/activation-codes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_id: paymentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Impossible de générer le code");
          return;
        }
        setGeneratedCode(data.code.code);
        toast.success(`Code généré : ${data.code.code}`);
        router.refresh();
      } else {
        const status = action === "validate" ? "validated" : "rejected";
        const res = await fetch(`/api/super-admin/payments/${paymentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Action impossible");
          return;
        }
        toast.success(data.message);
        router.refresh();
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header avec filtre + bouton nouveau */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {total} paiement{total > 1 ? "s" : ""}
            </span>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Enregistrer un paiement
          </Button>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Aucun paiement trouvé
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Cliquez sur "Enregistrer un paiement" pour commencer
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Destinataire</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Formule</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Moyen</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const statusInfo = PAYMENT_STATUS_LABELS[payment.status];
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {payment.lead_name ?? payment.establishment_name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payment.lead_name ? "Prospect" : "Établissement"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payment.plan_name ? (
                            <Badge variant="outline">{payment.plan_name}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatFCFA(payment.amount_fcfa)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {payment.paid_at ? formatDateTime(payment.paid_at) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {payment.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-8"
                                  onClick={() => handleAction(payment.id, "validate")}
                                  disabled={actionLoading === `${payment.id}-validate`}
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" />
                                  Valider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleAction(payment.id, "reject")}
                                  disabled={actionLoading === `${payment.id}-reject`}
                                >
                                  <Ban className="mr-1 h-3.5 w-3.5" />
                                  Rejeter
                                </Button>
                              </>
                            )}
                            {payment.status === "validated" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8"
                                onClick={() => handleAction(payment.id, "generate")}
                                disabled={actionLoading === `${payment.id}-generate`}
                              >
                                <Ticket className="mr-1 h-3.5 w-3.5" />
                                Générer code
                              </Button>
                            )}
                            {(payment.status === "rejected" || payment.status === "refunded") && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Dialog nouveau paiement */}
      <PaymentFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        leads={leads}
        establishments={establishments}
        plans={plans}
      />

      {/* Dialog code généré */}
      <Dialog open={!!generatedCode} onOpenChange={(v) => !v && setGeneratedCode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Code d'activation généré</DialogTitle>
            <DialogDescription>
              Copiez ce code et envoyez-le au client par WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center">
              <p className="text-xs text-muted-foreground mb-2">Code d'activation</p>
              <p className="text-2xl font-bold tracking-wider text-primary">
                {generatedCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  if (generatedCode) {
                    navigator.clipboard.writeText(generatedCode);
                    toast.success("Code copié dans le presse-papier");
                  }
                }}
              >
                Copier le code
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setGeneratedCode(null)}
              >
                Fermer
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Le code est valide 30 jours. Vous pouvez le retrouver dans la section "Codes d'activation".
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
