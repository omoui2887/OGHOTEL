"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ban,
  LogIn,
  LogOut,
  ArrowLeft,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

  async function handleCancel() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(data.message ?? "Réservation annulée");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
      setShowCancel(false);
    }
  }

  async function handleCheckIn() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservation.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(data.message ?? "Check-in effectué");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckOut() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservation.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(data.message ?? "Check-out effectué");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canCheckIn && (
        <Button
          size="sm"
          onClick={handleCheckIn}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
          Check-in
        </Button>
      )}

      {canCheckOut && (
        <Button
          size="sm"
          onClick={handleCheckOut}
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
              onClick={handleCancel}
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
