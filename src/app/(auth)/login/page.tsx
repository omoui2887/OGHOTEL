import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Hotel, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth";
import { getRedirectPathForRole } from "@/lib/roles";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  // Si l'utilisateur est déjà connecté avec un profil, on le redirige
  // vers son espace selon son rôle.
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(getRedirectPathForRole(profile.role));
  }

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
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace de gestion
          </CardDescription>
        </CardHeader>

        {/* LoginForm utilise useSearchParams → doit être dans un Suspense */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Card>

      {/* Note d'information */}
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Connexion sécurisée via Supabase Auth</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Vous n'avez pas de compte ?{" "}
          <Link
            href="/#contact"
            className="font-medium text-primary hover:underline"
          >
            Demander une démo
          </Link>
        </p>
      </div>

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
