"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PAYMENT_METHOD_OPTIONS } from "@/lib/super-admin/payments";
import type { Reservation } from "@/lib/hotel/reservations";
import { formatFCFA, formatDate } from "@/lib/utils";

type Props = {
  arrivals: (Reservation & { room_number: string | null })[];
};

export function CheckInList({ arrivals }: Props) {
  const router = useRouter();
  const [checkInTarget, setCheckInTarget] = React.useState<
    (Reservation & { room_number: string | null }) | null
  >(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");

  const today = new Date().toISOString().split("T")[0];

  async function handleCheckIn() {
    if (!checkInTarget) return;
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        reservation_id: checkInTarget.id,
      };

      if (paymentAmount && Number(paymentAmount) > 0) {
        body.payment = {
          amount: Number(paymentAmount),
          method: paymentMethod,
        };
      }

      const res = await fetch("/api/hotel/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(`Check-in effectué — ${checkInTarget.guest_name} installé en chambre ${checkInTarget.room_number}`);
      setCheckInTarget(null);
      setPaymentAmount("");
      setPaymentMethod("");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  function openDialog(r: Reservation & { room_number: string | null }) {
    setCheckInTarget(r);
    setPaymentAmount(r.balance_amount > 0 ? String(r.balance_amount) : "");
    setPaymentMethod("");
  }

  if (arrivals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <LogIn className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucune arrivée prévue
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Les réservations confirmées des 7 prochains jours apparaîtront ici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {arrivals.map((r) => {
        const isToday = r.check_in_date === today;
        const isLate = r.check_in_date < today;
        return (
          <Card key={r.id} className={isToday ? "border-primary/40" : ""}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.guest_name}</p>
                  {isToday && (
                    <Badge variant="success" className="text-xs">
                      Aujourd'hui
                    </Badge>
                  )}
                  {isLate && (
                    <Badge variant="destructive" className="text-xs">
                      En retard
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
                    Solde restant : {formatFCFA(r.balance_amount)}
                    {r.paid_amount > 0 && ` (acompte ${formatFCFA(r.paid_amount)})`}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/app/reservations/${r.id}`} prefetch>
                    <Eye className="mr-1 h-4 w-4" />
                    Détail
                  </Link>
                </Button>
                <Button size="sm" onClick={() => openDialog(r)}>
                  <LogIn className="mr-1 h-4 w-4" />
                  Check-in
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog check-in */}
      <Dialog open={!!checkInTarget} onOpenChange={(v) => !v && setCheckInTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check-in — {checkInTarget?.guest_name}</DialogTitle>
            <DialogDescription>
              Confirmez l'arrivée du client. La chambre passera en statut "Occupée".
            </DialogDescription>
          </DialogHeader>

          {checkInTarget && (
            <div className="space-y-4">
              {/* Récapitulatif */}
              <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chambre</span>
                  <span className="font-medium">{checkInTarget.room_number} · {checkInTarget.room_type_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Séjour</span>
                  <span className="font-medium">
                    {formatDate(checkInTarget.check_in_date)} → {formatDate(checkInTarget.check_out_date)} ({checkInTarget.nights}n)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatFCFA(checkInTarget.total_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acompte payé</span>
                  <span className="font-medium text-emerald-600">{formatFCFA(checkInTarget.paid_amount)}</span>
                </div>
                {checkInTarget.balance_amount > 0 && (
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-medium">Solde restant</span>
                    <span className="font-bold text-destructive">{formatFCFA(checkInTarget.balance_amount)}</span>
                  </div>
                )}
              </div>

              {/* Paiement à l'arrivée */}
              {checkInTarget.balance_amount > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Encaisser un paiement à l'arrivée (optionnel)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="ci-amount">Montant (FCFA)</Label>
                      <Input
                        id="ci-amount"
                        type="number"
                        min={0}
                        placeholder={String(checkInTarget.balance_amount)}
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
                  {paymentAmount && Number(paymentAmount) > 0 && !paymentMethod && (
                    <p className="text-xs text-destructive">
                      Veuillez sélectionner un moyen de paiement
                    </p>
                  )}
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCheckInTarget(null)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCheckIn}
                  disabled={
                    isLoading ||
                    (!!paymentAmount && Number(paymentAmount) > 0 && !paymentMethod)
                  }
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="mr-2 h-4 w-4" />
                  )}
                  Confirmer le check-in
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
