import Link from "next/link";
import { Hotel, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Hotel className="h-10 w-10" />
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez l'URL
          ou retournez à l'accueil.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              <Search className="mr-2 h-4 w-4" />
              Aller à la connexion
            </Link>
          </Button>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          {APP_NAME} — Si le problème persiste, contactez le support au +225 05 76 10 32 77
        </p>
      </div>
    </div>
  );
}
