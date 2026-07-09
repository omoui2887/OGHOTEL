import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Globe,
  FileText,
  Pencil,
  Calendar,
  Wallet,
  History,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getCurrentProfile,
} from "@/lib/auth";
import {
  getGuestById,
  getGuestReservations,
  getGuestPayments,
} from "@/lib/hotel/guests-server";
import { GuestFormDialog } from "@/components/hotel/guest-form-dialog";
import { GuestDetailActions } from "@/components/hotel/guest-detail-actions";
import { PermissionDenied } from "@/components/hotel/permission-denied";
import { canAccessModule } from "@/lib/roles";
import { ID_TYPE_LABELS } from "@/lib/hotel/guests";
import { formatDate, formatDateTime, formatFCFA } from "@/lib/utils";

export const metadata = {
  title: "Fiche client",
};

type Params = Promise<{ id: string }>;

const RESERVATION_STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  pending: { label: "En attente", variant: "warning" },
  confirmed: { label: "Confirmée", variant: "default" },
  checked_in: { label: "Arrivé", variant: "success" },
  checked_out: { label: "Terminé", variant: "secondary" },
  cancelled: { label: "Annulée", variant: "destructive" },
  no_show: { label: "No-show", variant: "destructive" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  orange: "Orange Money",
  mtn: "MTN Money",
  moov: "Moov Money",
  wave: "Wave",
  card: "Carte",
  transfer: "Virement",
};

export default async function GuestDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile || !profile.establishment_id) {
    notFound();
  }

  if (!canAccessModule(profile.role, "/app/guests")) {
    return <PermissionDenied />;
  }

  const [guest, reservations, payments] = await Promise.all([
    getGuestById(id, profile.establishment_id),
    getGuestReservations(id, profile.establishment_id),
    getGuestPayments(id, profile.establishment_id),
  ]);

  if (!guest) {
    notFound();
  }

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(
    profile.role
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReservations = reservations.length;
  const completedStays = reservations.filter((r) => r.status === "checked_out").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/guests" aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {guest.full_name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Client depuis le {formatDate(guest.created_at)}
          </p>
        </div>
        {canEdit && <GuestDetailActions guest={guest} />}
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Réservations</p>
              <p className="text-xl font-bold">{totalReservations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Séjours terminés</p>
              <p className="text-xl font-bold">{completedStays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total payé</p>
              <p className="text-xl font-bold">{formatFCFA(totalPaid)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : infos client */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-medium">{guest.phone}</p>
                </div>
              </div>

              {guest.email && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{guest.email}</p>
                  </div>
                </div>
              )}

              {guest.nationality && (
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nationalité</p>
                    <p className="text-sm font-medium">{guest.nationality}</p>
                  </div>
                </div>
              )}

              {guest.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Adresse</p>
                    <p className="text-sm font-medium">{guest.address}</p>
                  </div>
                </div>
              )}

              <Separator />

              {guest.id_type && (
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pièce d'identité</p>
                    <Badge variant="outline" className="mt-0.5">
                      {ID_TYPE_LABELS[guest.id_type] ?? guest.id_type}
                    </Badge>
                    {guest.id_number && (
                      <p className="mt-1 text-sm font-medium">{guest.id_number}</p>
                    )}
                  </div>
                </div>
              )}

              {guest.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{guest.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : historiques */}
        <div className="space-y-6 lg:col-span-2">
          {/* Historique réservations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des réservations</CardTitle>
              <CardDescription className="text-xs">
                {totalReservations} réservation{totalReservations > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucune réservation pour ce client
                </p>
              ) : (
                <div className="space-y-3">
                  {reservations.map((r) => {
                    const statusInfo = RESERVATION_STATUS_LABELS[r.status] ?? {
                      label: r.status,
                      variant: "outline" as const,
                    };
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Chambre {r.room_number}
                            </span>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(r.check_in_date)} → {formatDate(r.check_out_date)} ·{" "}
                            {r.nights} nuit{r.nights > 1 ? "s" : ""}
                            {r.room_type_name ? ` · ${r.room_type_name}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatFCFA(r.total_amount)}</p>
                          {r.balance_amount > 0 && (
                            <p className="text-xs text-destructive">
                              Solde : {formatFCFA(r.balance_amount)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique paiements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des paiements</CardTitle>
              <CardDescription className="text-xs">
                {payments.length} paiement{payments.length > 1 ? "s" : ""} · Total : {formatFCFA(totalPaid)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aucun paiement pour ce client
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{formatFCFA(p.amount)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[p.method] ?? p.method} · Chambre {p.room_number}
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
      </div>
    </div>
  );
}
