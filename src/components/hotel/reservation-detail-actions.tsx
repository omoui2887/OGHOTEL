"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Ban,
  LogIn,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  RESERVATION_STATUS_LABELS,
  type Reservation,
} from "@/lib/hotel/reservations";

type Props = {
  reservation: Reservation;
  canEdit: boolean;
};

export function ReservationDetailActions({ reservation, canEdit }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);

  const canCancel = ["pending", "confirmed"].includes(reservation.status);
  const canCheckIn = reservation.status === "confirmed";
  const canCheckOut = reservation.status === "checked_in";

  async function handleAction(action: "cancel" | "check_in" | "check_out") {
    setIsLoading(true);
    try {
      const body =
        action === "cancel"
          ? { action: "cancel" }
          : { status: action };

      const res = await fetch(`/api/hotel/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(data.message);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
      setShowCancel(false);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/app/reservations/${reservation.id}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Link>
      </Button>

      {canCheckIn && (
        <Button
          size="sm"
          onClick={() => handleAction("check_in")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
          Check-in
        </Button>
      )}

      {canCheckOut && (
        <Button
          size="sm"
          onClick={() => handleAction("check_out")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          Check-out
        </Button>
      )}

      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCancel(true)}
          disabled={isLoading}
        >
          <Ban className="mr-2 h-4 w-4 text-destructive" />
          Annuler
        </Button>
      )}

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              La réservation de {reservation.guest_name} sera annulée. La chambre
              redeviendra disponible. Cette action est réversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("cancel")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Annulation…" : "Confirmer l'annulation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
