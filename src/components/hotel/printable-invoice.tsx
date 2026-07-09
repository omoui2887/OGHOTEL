"use client";

import { Printer, Ban, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  type Invoice,
} from "@/lib/hotel/invoices";
import { PAYMENT_METHOD_LABELS } from "@/lib/hotel/payments";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";

type Props = {
  invoice: Invoice;
  canCancel: boolean;
};

export function PrintableInvoice({ invoice, canCancel }: Props) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);

  const statusInfo = INVOICE_STATUS_LABELS[invoice.status];

  async function handlePrint() {
    window.print();
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/hotel/invoices/${invoice.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Facture annulée");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsCancelling(false);
    }
  }

  const isCancelled = invoice.status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Actions (masquées à l'impression) */}
      <div className="flex items-center gap-3 print:hidden">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/invoices" prefetch aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {INVOICE_TYPE_LABELS[invoice.type]} {invoice.invoice_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            {invoice.guest_name} · {formatDate(invoice.issued_at ?? invoice.created_at)}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
        {canCancel && !isCancelled && (
          <Button onClick={handleCancel} variant="outline" size="sm" disabled={isCancelling}>
            {isCancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4 text-destructive" />
            )}
            Annuler
          </Button>
        )}
      </div>

      {/* Document imprimable */}
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-8 print:border-0 print:p-0">
        {/* En-tête établissement */}
        <div className="flex items-start justify-between border-b-2 border-primary pb-4">
          <div className="flex items-center gap-3">
            {invoice.establishment_logo_url ? (
              <img
                src={invoice.establishment_logo_url}
                alt="Logo"
                className="h-16 w-16 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
                {invoice.establishment_name?.charAt(0) ?? "O"}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{invoice.establishment_name}</h2>
              {invoice.establishment_address && (
                <p className="text-sm text-muted-foreground">{invoice.establishment_address}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {invoice.establishment_city}
                {invoice.establishment_phone ? ` · ${invoice.establishment_phone}` : ""}
              </p>
              {invoice.establishment_email && (
                <p className="text-sm text-muted-foreground">{invoice.establishment_email}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {INVOICE_TYPE_LABELS[invoice.type].toUpperCase()}
            </p>
            <p className="font-mono text-sm font-medium">{invoice.invoice_number}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(invoice.issued_at ?? invoice.created_at)}
            </p>
          </div>
        </div>

        {/* Filigrane annulée */}
        {isCancelled && (
          <div className="my-8 flex items-center justify-center">
            <span className="rotate-[-15deg] rounded-lg border-4 border-destructive px-8 py-2 text-3xl font-bold text-destructive opacity-50">
              ANNULÉE
            </span>
          </div>
        )}

        {/* Client */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Client
            </p>
            <p className="font-medium">{invoice.guest_name}</p>
            {invoice.guest_phone && (
              <p className="text-sm text-muted-foreground">{invoice.guest_phone}</p>
            )}
            {invoice.guest_email && (
              <p className="text-sm text-muted-foreground">{invoice.guest_email}</p>
            )}
            {invoice.guest_nationality && (
              <p className="text-sm text-muted-foreground">{invoice.guest_nationality}</p>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Séjour
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Chambre :</span>{" "}
              <span className="font-medium">{invoice.room_number}</span>
              {invoice.room_type_name && ` (${invoice.room_type_name})`}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Arrivée :</span>{" "}
              <span className="font-medium">{formatDate(invoice.check_in_date)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Départ :</span>{" "}
              <span className="font-medium">{formatDate(invoice.check_out_date)}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Durée :</span>{" "}
              <span className="font-medium">
                {invoice.nights} nuit{invoice.nights && invoice.nights > 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Détails */}
        <div className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-center">Qté</th>
                <th className="pb-2 text-right">Prix unitaire</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-3">
                  Hébergement — Chambre {invoice.room_number}
                  {invoice.room_type_name ? ` ${invoice.room_type_name}` : ""}
                </td>
                <td className="py-3 text-center">{invoice.nights}</td>
                <td className="py-3 text-right">{formatFCFA(invoice.rate_amount ?? 0)}</td>
                <td className="py-3 text-right font-medium">
                  {formatFCFA((invoice.rate_amount ?? 0) * (invoice.nights ?? 0))}
                </td>
              </tr>
              {(invoice.discount_amount ?? 0) > 0 && (
                <tr className="border-b border-border/50">
                  <td className="py-3 text-emerald-600">Remise</td>
                  <td className="py-3 text-center">—</td>
                  <td className="py-3 text-right">—</td>
                  <td className="py-3 text-right font-medium text-emerald-600">
                    -{formatFCFA(invoice.discount_amount ?? 0)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td colSpan={3} className="pt-3 text-right font-semibold">
                  Total
                </td>
                <td className="pt-3 text-right text-lg font-bold text-primary">
                  {formatFCFA(invoice.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Récapitulatif paiements */}
        {invoice.payments.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Paiements reçus
            </p>
            <div className="space-y-1">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded border border-border/50 px-3 py-1.5 text-sm"
                >
                  <div>
                    <span className="font-medium">{formatFCFA(p.amount)}</span>
                    <span className="ml-2 text-muted-foreground">
                      {PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}
                    </span>
                    {p.reference && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Réf : {p.reference}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(p.payment_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solde */}
        <div className="mt-4 flex justify-end">
          <div className="w-48 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatFCFA(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Payé</span>
              <span className="font-medium">{formatFCFA(invoice.paid_amount ?? 0)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 text-base">
              <span className="font-bold">Solde</span>
              <span
                className={`font-bold ${
                  (invoice.balance_amount ?? 0) > 0 ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {formatFCFA(invoice.balance_amount ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Signature / Cachet */}
        <div className="mt-12 flex items-end justify-between">
          <div className="text-xs text-muted-foreground">
            <p>Document généré le {formatDate(invoice.created_at)}</p>
            <p>Merci de votre confiance.</p>
          </div>
          <div className="text-center">
            <div className="mb-1 h-16 w-32 border-b border-dashed border-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Signature / Cachet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
