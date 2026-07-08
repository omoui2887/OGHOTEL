"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, Eye, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_METHOD_OPTIONS,
} from "@/lib/super-admin/payments";
import type { Reservation } from "@/lib/hotel/reservations";
import { formatFCFA, formatDate } from "@/lib/utils";

type Props = {
  stays: (Reservation & { room_number: string | null })[];
  canForceUnpaid: boolean;
};

export function CheckOutList({ stays, canForceUnpaid }: Props) {
  const router = useRouter();
  const [checkOutTarget, setCheckOutTarget] = React.useState<
    (Reservation & { room_number: string | null }) | null
  >(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [extraCharges, setExtraCharges] = React.useState("");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [forceUnpaid, setForceUnpaid] = React.useState(false);
  const [invoiceUrl, setInvoiceUrl] = React.useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  function openDialog(r: Reservation & { room_number: string | null }) {
    setCheckOutTarget(r);
    setExtraCharges("");
    setPaymentAmount(r.balance_amount > 0 ? String(r.balance_amount) : "");
    setPaymentMethod("");
    setForceUnpaid(false);
    setInvoiceUrl(null);
  }

  async function handleCheckOut() {
    if (!checkOutTarget) return;
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        reservation_id: checkOutTarget.id,
      };

      if (extraCharges && Number(extraCharges) > 0) {
        body.extra_charges = Number(extraCharges);
      }

      if (paymentAmount && Number(paymentAmount) > 0) {
        body.payment = {
          amount: Number(paymentAmount),
          method: paymentMethod,
        };
      }

      if (forceUnpaid) {
        body.force_unpaid = true;
      }

      const res = await fetch("/api/hotel/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(`Check-out effectué — ${checkOutTarget.guest_name} a quitté la chambre ${checkOutTarget.room_number}`);
      setCheckOutTarget(null);
      setExtraCharges("");
      setPaymentAmount("");
      setPaymentMethod("");
      setForceUnpaid(false);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  if (stays.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <LogOut className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucun séjour en cours
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Les clients actuellement check-in apparaîtront ici
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculs pour le dialog
  const targetTotal = checkOutTarget
    ? checkOutTarget.total_amount + (Number(extraCharges) || 0)
    : 0;
  const targetPaid = checkOutTarget
    ? checkOutTarget.paid_amount + (Number(paymentAmount) || 0)
    : 0;
  const targetBalance = targetTotal - targetPaid;

  return (
    <div className="space-y-3">
      {stays.map((r) => {
        const isDepartureToday = r.check_out_date === today;
        const isLateDeparture = r.check_out_date < today;
        return (
          <Card key={r.id} className={isDepartureToday ? "border-primary/40" : ""}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.guest_name}</p>
                  {isDepartureToday && (
                    <Badge variant="success" className="text-xs">
                      Départ aujourd'hui
                    </Badge>
                  )}
                  {isLateDeparture && (
                    <Badge variant="destructive" className="text-xs">
                      Départ dépassé
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Chambre {r.room_number} · {r.room_type_name}</span>
                  <span>{formatDate(r.check_in_date)} → {formatDate(r.check_out_date)}</span>
                  <span>{r.nights} nuit{r.nights > 1 ? "s" : ""}</span>
                  <span className="font-medium text-foreground">{formatFCFA(r.total_amount)}</span>
                </div>
                {r.balance_amount > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    Solde impayé : {formatFCFA(r.balance_amount)}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/app/reservations/${r.id}`}>
                    <Eye className="mr-1 h-4 w-4" />
                    Détail
                  </Link>
                </Button>
                <Button size="sm" onClick={() => openDialog(r)}>
                  <LogOut className="mr-1 h-4 w-4" />
                  Check-out
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog check-out */}
      <Dialog open={!!checkOutTarget} onOpenChange={(v) => !v && setCheckOutTarget(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Check-out — {checkOutTarget?.guest_name}</DialogTitle>
            <DialogDescription>
              Confirmez le départ du client. Une facture sera générée et une
              tâche de ménage sera créée automatiquement.
            </DialogDescription>
          </DialogHeader>

          {checkOutTarget && (
            <div className="space-y-4">
              {/* Récapitulatif actuel */}
              <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chambre</span>
                  <span className="font-medium">{checkOutTarget.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total actuel</span>
                  <span className="font-medium">{formatFCFA(checkOutTarget.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Déjà payé</span>
                  <span className="font-medium text-emerald-600">{formatFCFA(checkOutTarget.paid_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Solde actuel</span>
                  <span className={`font-bold ${checkOutTarget.balance_amount > 0 ? "text-destructive" : "text-emerald-600"}`}>
                    {formatFCFA(checkOutTarget.balance_amount)}
                  </span>
                </div>
              </div>

              {/* Frais supplémentaires */}
              <div className="space-y-2">
                <Label htmlFor="extra-charges">Frais supplémentaires (FCFA)</Label>
                <Input
                  id="extra-charges"
                  type="number"
                  min={0}
                  step={1000}
                  placeholder="0"
                  value={extraCharges}
                  onChange={(e) => setExtraCharges(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Mini-bar, services additionnels, etc.
                </p>
              </div>

              {/* Paiement du solde */}
              {targetBalance > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Encaisser le solde ({formatFCFA(targetBalance)})
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="co-amount">Montant (FCFA)</Label>
                      <Input
                        id="co-amount"
                        type="number"
                        min={0}
                        placeholder={String(targetBalance)}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Moyen</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHOD_OPTIONS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Nouveau solde après calculs */}
              {(Number(extraCharges) > 0 || Number(paymentAmount) > 0) && (
                <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nouveau total</span>
                    <span className="font-medium">{formatFCFA(targetTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total payé</span>
                    <span className="font-medium text-emerald-600">{formatFCFA(targetPaid)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Nouveau solde</span>
                    <span className={targetBalance > 0 ? "text-destructive" : "text-emerald-600"}>
                      {formatFCFA(targetBalance)}
                    </span>
                  </div>
                </div>
              )}

              {/* Forcer check-out avec solde impayé */}
              {targetBalance > 0 && canForceUnpaid && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
                  <Checkbox
                    id="force-unpaid"
                    checked={forceUnpaid}
                    onCheckedChange={(v) => setForceUnpaid(v === true)}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="force-unpaid" className="text-sm font-medium cursor-pointer">
                      Forcer le check-out avec solde impayé
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Le client part sans payer le solde de {formatFCFA(targetBalance)}.
                      La facture sera émise mais non payée.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCheckOutTarget(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={
                    isLoading ||
                    (!!paymentAmount && Number(paymentAmount) > 0 && !paymentMethod)
                  }
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Confirmer le check-out
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
