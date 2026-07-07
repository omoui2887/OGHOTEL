import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

export default function AppPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Card className="max-w-md text-center shadow-lg">
        <CardContent className="space-y-4 p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Construction className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Espace Établissement</h1>
          <p className="text-sm text-muted-foreground">
            Application de gestion hôtelière {APP_NAME} — chambres, réservations,
            check-in/out, paiements, factures, rapports.
          </p>
          <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            Ce module sera développé à l'étape 13 du plan de construction.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
