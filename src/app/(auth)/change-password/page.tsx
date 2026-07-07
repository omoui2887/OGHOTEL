import Link from "next/link";
import { Hotel, ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export const metadata = {
  title: "Changer mon mot de passe",
};

export default function ChangePasswordPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center gap-2 font-semibold"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Hotel className="h-5 w-5" />
        </span>
        <span className="text-xl tracking-tight">{APP_NAME}</span>
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Changer mon mot de passe</CardTitle>
          <CardDescription>
            Pour votre sécurité, vous devez définir un nouveau mot de passe
            avant d'accéder à votre espace.
          </CardDescription>
        </CardHeader>

        <ChangePasswordForm />
      </Card>

      {/* Avertissement sécurité */}
      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Choisissez un mot de passe unique, différent de votre mot de passe
          initial. Il sera requis pour toutes vos prochaines connexions à {APP_NAME}.
        </p>
      </div>

      <div className="text-center">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </Button>
      </div>
    </div>
  );
}
