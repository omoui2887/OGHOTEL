import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { RegisterForm } from "@/components/activation/register-form";
import { verifyActivationCode } from "@/lib/activation/server";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  RegistrationStepsSidebar,
  HorizontalStepper,
} from "@/components/auth/registration-steps-sidebar";

export const metadata = {
  title: "Créer mon compte — " + APP_NAME,
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
  // Défensif : si Supabase n'est pas configuré, on affiche quand même la page
  // avec un état d'erreur propre (au lieu de planter).
  let verify: { valid: true; code: any } | { valid: false; error: string };
  try {
    verify = await verifyActivationCode(code);
  } catch (err) {
    verify = {
      valid: false,
      error:
        "Service temporairement indisponible. Veuillez réessayer dans quelques instants.",
    };
  }

  // Cas code invalide — on affiche la sidebar + contenu d'erreur
  if (!verify.valid) {
    return (
      <AuthSplitLayout
        sidebarVariant="navy"
        sidebar={<RegistrationStepsSidebar currentStep={1} />}
      >
        <div className="w-full max-w-md">
          <HorizontalStepper currentStep={1} />
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold">Code invalide</h1>
            <p className="mt-2 text-sm text-muted-foreground">{verify.error}</p>
          </div>
          <div className="mt-5 text-center">
            <Button asChild>
              <Link href="/activation">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la saisie du code
              </Link>
            </Button>
          </div>
        </div>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout
      sidebarVariant="navy"
      sidebar={<RegistrationStepsSidebar currentStep={2} />}
    >
      {/* === CONTENU DROIT — FORMULAIRE === */}
      <div className="w-full max-w-2xl">
        {/* Stepper horizontal */}
        <HorizontalStepper currentStep={2} />

        {/* Titre */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Créer mon établissement
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Renseignez les informations de votre établissement et créez votre
            compte Admin Hôtel pour accéder à {APP_NAME}.
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
          {/* Badge plan */}
          <div className="mb-5 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
            <div>
              <p className="text-xs text-muted-foreground">Formule choisie</p>
              <p className="text-sm font-semibold text-primary">
                {verify.code.plan_name}
              </p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {new Intl.NumberFormat("fr-FR").format(
                verify.code.plan_price_fcfa
              )}{" "}
              FCFA/an
            </p>
          </div>

          <RegisterForm
            code={verify.code.code}
            leadName={verify.code.lead_name}
            planName={verify.code.plan_name}
          />
        </div>

        {/* Lien retour */}
        <div className="mt-5 text-center">
          <Link
            href="/activation"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Utiliser un autre code
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
