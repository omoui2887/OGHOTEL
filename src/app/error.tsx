"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold">Une erreur est survenue</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Désolé, une erreur inattendue s'est produite. Vous pouvez réessayer
          ou retourner à l'accueil. Si le problème persiste, contactez le support.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Code d'erreur : {error.digest}
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          {APP_NAME} — Support : +225 05 76 10 32 77
        </p>
      </div>
    </div>
  );
}
