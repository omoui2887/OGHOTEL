"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  Inbox,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
  Plus,
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
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  type Invoice,
} from "@/lib/hotel/invoices";
import { formatFCFA, formatDate } from "@/lib/utils";

type Props = {
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
  initialSearch: string;
  initialStatus: string;
  initialType: string;
  canEdit: boolean;
  reservations: {
    id: string;
    guest_name: string | null;
    room_number: string | null;
    balance_amount: number;
    total_amount: number;
  }[];
};

export function InvoicesList({
  invoices,
  total,
  page,
  totalPages,
  initialSearch,
  initialStatus,
  initialType,
  canEdit,
  reservations,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(initialSearch);
  const [status, setStatus] = React.useState(initialStatus);
  const [type, setType] = React.useState(initialType);
  const [showGenDialog, setShowGenDialog] = React.useState(false);
  const [genResa, setGenResa] = React.useState("");
  const [genType, setGenType] = React.useState<"invoice" | "receipt">("invoice");
  const [isLoading, setIsLoading] = React.useState(false);

  const updateUrl = React.useCallback(
    (params: { search: string; status: string; type: string; page: number }) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.status && params.status !== "all") sp.set("status", params.status);
      if (params.type && params.type !== "all") sp.set("type", params.type);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/invoices${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      updateUrl({ search, status, type, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [search, status, type, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ search, status, type, page: p });
  }

  async function handleGenerate() {
    if (!genResa) {
      toast.error("Veuillez sélectionner une réservation");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: genResa, type: genType }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success(data.message);
      setShowGenDialog(false);
      setGenResa("");
      router.refresh();
      // Rediriger vers la facture
      if (data.id) {
        router.push(`/app/invoices/${data.id}`);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher (client, numéro)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="issued">Émise</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="invoice">Factures</SelectItem>
                <SelectItem value="receipt">Reçus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canEdit && (
            <Button onClick={() => setShowGenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Générer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune facture ou reçu
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {canEdit
                ? "Générez une facture depuis une réservation"
                : "Les factures et reçus apparaîtront ici"}
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
                    <th className="px-4 py-3 font-medium text-muted-foreground">Numéro</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Chambre</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const statusInfo = INVOICE_STATUS_LABELS[inv.status];
                    return (
                      <tr
                        key={inv.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium">
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {inv.type === "invoice" ? (
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="text-xs">
                              {INVOICE_TYPE_LABELS[inv.type]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {inv.guest_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {inv.room_number ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatFCFA(inv.total_amount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(inv.issued_at ?? inv.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <Link href={`/app/invoices/${inv.id}`} prefetch aria-label="Voir">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Dialog génération */}
      <Dialog open={showGenDialog} onOpenChange={setShowGenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Générer un document</DialogTitle>
            <DialogDescription>
              Choisissez une réservation et le type de document à générer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Réservation</Label>
              <Select value={genResa} onValueChange={setGenResa}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {reservations.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.guest_name} — Ch {r.room_number} — {formatFCFA(r.total_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type de document</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGenType("invoice")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    genType === "invoice"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">Facture</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGenType("receipt")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    genType === "receipt"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <Receipt className="h-6 w-6" />
                  <span className="text-sm font-medium">Reçu</span>
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading || !genResa}>
                {isLoading ? "Génération..." : "Générer"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
