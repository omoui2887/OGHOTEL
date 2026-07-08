import Link from "next/link";
import { Ticket, ArrowLeft } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { ActivationForm } from "@/components/activation/activation-form";

export const metadata = {
  title: "Activer mon compte",
};

export default function ActivationPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Ticket className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Activer mon compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez le code d'activation que vous avez reçu par WhatsApp pour
          créer votre espace de gestion.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Code d'activation</CardTitle>
          <CardDescription>
            Le code a été fourni par l'équipe {APP_NAME} après validation de votre paiement.
          </CardDescription>
        </CardHeader>
        <ActivationForm />
      </Card>

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
