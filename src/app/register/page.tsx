import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ArrowLeft, AlertCircle } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { RegisterForm } from "@/components/activation/register-form";
import { verifyActivationCode } from "@/lib/activation/server";

export const metadata = {
  title: "Créer mon compte",
};

type SearchParams = Promise<{
  code?: string;
  name?: string;
}>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const code = sp.code ?? "";

  // Si pas de code dans l'URL, rediriger vers /activation
  if (!code) {
    redirect("/activation");
  }

  // Re-vérifier le code côté serveur (sécurité)
  const verify = await verifyActivationCode(code);

  if (!verify.valid) {
    // Code invalide → afficher page d'erreur avec lien vers /activation
    return (
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border-destructive/30">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Code invalide</CardTitle>
            <CardDescription>{verify.error}</CardDescription>
          </CardHeader>
        </Card>

        <div className="text-center">
          <Button asChild>
            <Link href="/activation">Retour à la saisie du code</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Créer mon établissement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les informations de votre établissement et créez votre
          compte Admin Hôtel pour accéder à {APP_NAME}.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Informations de l'établissement</CardTitle>
          <CardDescription>
            Formule : <span className="font-medium text-primary">{verify.code.plan_name}</span>
            {" — "}
            {new Intl.NumberFormat("fr-FR").format(verify.code.plan_price_fcfa)} FCFA/an
          </CardDescription>
        </CardHeader>
        <RegisterForm
          code={verify.code.code}
          leadName={verify.code.lead_name}
          planName={verify.code.plan_name}
        />
      </Card>

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/activation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Utiliser un autre code
          </Link>
        </Button>
      </div>
    </div>
  );
}
