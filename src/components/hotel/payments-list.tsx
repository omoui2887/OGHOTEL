"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  type StayPayment,
  type PaymentMethod,
} from "@/lib/hotel/payments";
import { formatFCFA, formatDateTime } from "@/lib/utils";

type Props = {
  payments: StayPayment[];
  total: number;
  totalAmount: number;
  page: number;
  totalPages: number;
  initialSearch: string;
  initialMethod: string;
  canEdit: boolean;
  reservations: {
    id: string;
    guest_name: string | null;
    room_number: string | null;
    balance_amount: number;
  }[];
};

export function PaymentsList({
  payments,
  total,
  totalAmount,
  page,
  totalPages,
  initialSearch,
  initialMethod,
  canEdit,
  reservations,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(initialSearch);
  const [method, setMethod] = React.useState(initialMethod);
  const [showForm, setShowForm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedResa, setSelectedResa] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [payMethod, setPayMethod] = React.useState("");
  const [reference, setReference] = React.useState("");

  const updateUrl = React.useCallback(
    (params: { search: string; method: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.method && params.method !== "all") sp.set("method", params.method);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/payments${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      updateUrl({ search, method, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [search, method, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ search, method, page: p });
  }

  async function handleCreate() {
    if (!selectedResa || !amount || !payMethod) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/stay-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: selectedResa,
          amount: Number(amount),
          method: payMethod,
          reference: reference || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Paiement enregistré");
      setShowForm(false);
      setSelectedResa("");
      setAmount("");
      setPayMethod("");
      setReference("");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  // Calcul du solde de la réservation sélectionnée
  const selectedReservation = reservations.find((r) => r.id === selectedResa);

  return (
    <div className="space-y-4">
      {/* Filtres + bouton */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher (client, téléphone, réf)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les moyens</SelectItem>
                {PAYMENT_METHOD_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Total : {formatFCFA(totalAmount)}
            </span>
            {canEdit && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Encaisser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucun paiement
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Les paiements encaissés apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Chambre</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Moyen</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Référence</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.guest_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{p.guest_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.room_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        {formatFCFA(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {PAYMENT_METHOD_LABELS[p.method as PaymentMethod] ?? p.method}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.reference ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(p.payment_date)}
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

      {/* Dialog nouveau paiement */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encaisser un paiement</DialogTitle>
            <DialogDescription>
              Enregistrez un paiement pour une réservation. Le solde sera mis à
              jour automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sélection réservation */}
            <div className="space-y-2">
              <Label>
                Réservation <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedResa} onValueChange={(v) => {
                setSelectedResa(v);
                const r = reservations.find((res) => res.id === v);
                if (r) setAmount(String(r.balance_amount));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une réservation..." />
                </SelectTrigger>
                <SelectContent>
                  {reservations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.guest_name} — Ch {r.room_number} — Solde : {formatFCFA(r.balance_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedReservation && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solde restant</span>
                  <span className="font-bold text-destructive">
                    {formatFCFA(selectedReservation.balance_amount)}
                  </span>
                </div>
              </div>
            )}

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="pay-amount">
                Montant (FCFA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pay-amount"
                type="number"
                min={1}
                step={500}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Moyen */}
            <div className="space-y-2">
              <Label>
                Moyen de paiement <span className="text-destructive">*</span>
              </Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
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

            {/* Référence */}
            <div className="space-y-2">
              <Label htmlFor="pay-ref">Référence (optionnel)</Label>
              <Input
                id="pay-ref"
                placeholder="Ex : MP240107.1234.ABCD"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !selectedResa || !amount || !payMethod}
              >
                {isLoading ? "Enregistrement..." : "Encaisser"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
