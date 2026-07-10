import Link from "next/link";
import { ArrowRight, ShieldCheck, HelpCircle, MessageCircle } from "lucide-react";

import { APP_NAME, WHATSAPP_DISPLAY, SUPPORT_EMAIL } from "@/lib/constants";
import { ActivationForm } from "@/components/activation/activation-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  RegistrationStepsSidebar,
  HorizontalStepper,
} from "@/components/auth/registration-steps-sidebar";

export const metadata = {
  title: "Activer mon compte — " + APP_NAME,
};

export default function ActivationPage() {
  return (
    <AuthSplitLayout
      sidebarVariant="navy"
      sidebar={<RegistrationStepsSidebar currentStep={1} />}
    >
      {/* === CONTENU DROIT — FORMULAIRE === */}
      <div className="w-full max-w-md">
        {/* Stepper horizontal */}
        <HorizontalStepper currentStep={1} />

        {/* Titre */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Activation de votre compte
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Saisissez le code d&apos;activation fourni par l&apos;administrateur
            pour commencer votre inscription.
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-black/5 sm:p-7">
          <ActivationForm />

          {/* Aide */}
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-dashed border-[#0c1e3a]/30 bg-[#0c1e3a]/5 p-3.5">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#0c1e3a]" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Besoin d&apos;aide pour obtenir un code ?
              </p>
              <p className="mt-0.5">
                Contactez l&apos;équipe {APP_NAME} :
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={`https://wa.me/${WHATSAPP_DISPLAY.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#0c1e3a] hover:underline"
                >
                  <MessageCircle className="h-3 w-3" />
                  {WHATSAPP_DISPLAY}
                </a>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-[#0c1e3a] hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Lien connexion */}
        <div className="mt-5 text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            prefetch
            className="font-semibold text-[#0c1e3a] hover:underline"
          >
            Se connecter
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Badge sécurité */}
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Inscription sécurisée
        </div>
      </div>
    </AuthSplitLayout>
  );
}
