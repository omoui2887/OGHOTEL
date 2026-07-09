"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReservationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">Impossible de charger le formulaire</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Une erreur s'est produite lors du chargement du formulaire de réservation.
          Cela peut être dû à un problème de configuration ou de connexion.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/reservations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux réservations
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">Code : {error.digest}</p>
        )}
      </div>
    </div>
  );
}
