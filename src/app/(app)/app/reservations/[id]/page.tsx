import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  BedDouble,
  Users,
  Wallet,
  FileText,
  CreditCard,
  Tag,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCurrentProfile } from "@/lib/auth";
import { getReservationById } from "@/lib/hotel/reservations-server";
import { getGuestPayments } from "@/lib/hotel/guests-server";
import { ReservationDetailActions } from "@/components/hotel/reservation-detail-actions";
import {
  RESERVATION_STATUS_LABELS,
  RESERVATION_SOURCE_LABELS,
} from "@/lib/hotel/reservations";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Détail réservation",
};

type Params = Promise<{ id: string }>;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  orange: "Orange Money",
  mtn: "MTN Money",
  moov: "Moov Money",
  wave: "Wave",
  card: "Carte",
  transfer: "Virement",
};

export default async function ReservationDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile || !profile.establishment_id) {
    notFound();
  }

  const [reservation, payments] = await Promise.all([
    getReservationById(id, profile.establishment_id),
    getGuestPayments(id, profile.establishment_id).catch(() => []),
  ]);

  if (!reservation) {
    notFound();
  }

  const statusInfo = RESERVATION_STATUS_LABELS[reservation.status];
  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/reservations" aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Réservation
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {reservation.guest_name} · Chambre {reservation.room_number} ·{" "}
            {formatDate(reservation.check_in_date)} → {formatDate(reservation.check_out_date)}
          </p>
        </div>
        <ReservationDetailActions reservation={reservation} canEdit={canEdit} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : détails */}
        <div className="space-y-6 lg:col-span-2">
          {/* Client + Chambre */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <Link
                      href={`/app/guests/${reservation.guest_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {reservation.guest_name ?? "—"}
                    </Link>
                    {reservation.guest_phone && (
                      <p className="text-xs text-muted-foreground">{reservation.guest_phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BedDouble className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Chambre</p>
                    <p className="font-medium">{reservation.room_number ?? "—"}</p>
                    {reservation.room_type_name && (
                      <p className="text-xs text-muted-foreground">{reservation.room_type_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Séjour</p>
                    <p className="font-medium">
                      {formatDate(reservation.check_in_date)} → {formatDate(reservation.check_out_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.nights} nuit{reservation.nights > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Occupants</p>
                    <p className="font-medium">
                      {reservation.adults} adulte{reservation.adults > 1 ? "s" : ""}
                      {reservation.children > 0 && ` · ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-medium">
                      {RESERVATION_SOURCE_LABELS[reservation.source] ?? reservation.source}
                    </p>
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{reservation.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Paiements liés */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paiements liés</CardTitle>
              <CardDescription className="text-xs">
                {payments.length} paiement{payments.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aucun paiement enregistré pour cette réservation
                </p>
              ) : (
                <div className="space-y-2">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{formatFCFA(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[p.method] ?? p.method}
                          {p.reference ? ` · Réf : ${p.reference}` : ""}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(p.payment_date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : tarifs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tarif/nuit</span>
                <span className="font-medium">{formatFCFA(reservation.rate_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nuits</span>
                <span className="font-medium">{reservation.nights}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">
                  {formatFCFA(reservation.rate_amount * reservation.nights)}
                </span>
              </div>
              {reservation.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Remise</span>
                  <span className="font-medium">-{formatFCFA(reservation.discount_amount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">
                  {formatFCFA(reservation.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Acompte payé</span>
                <span className="font-medium text-emerald-600">
                  {formatFCFA(reservation.paid_amount)}
                </span>
              </div>
              <div className="flex justify-between text-base">
                <span className="font-semibold">Solde restant</span>
                <span
                  className={`font-bold ${
                    reservation.balance_amount > 0 ? "text-destructive" : "text-emerald-600"
                  }`}
                >
                  {formatFCFA(reservation.balance_amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le</span>
                <span>{formatDateTime(reservation.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifiée le</span>
                <span>{formatDateTime(reservation.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
