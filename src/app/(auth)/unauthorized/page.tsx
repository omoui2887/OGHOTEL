import Link from "next/link";
import { ShieldX, ArrowLeft, LogIn, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth";
import { getRedirectPathForRole, ROLE_LABELS } from "@/lib/roles";

export const metadata = {
  title: "Accès non autorisé",
};

export default async function UnauthorizedPage() {
  const profile = await getCurrentProfile();
  const dashboardPath = profile
    ? getRedirectPathForRole(profile.role)
    : null;

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="shadow-lg border-destructive/20">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Accès non autorisé</CardTitle>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            {profile ? (
              <>
                <p>
                  Connecté en tant que <strong>{profile.full_name ?? profile.email}</strong>
                </p>
                <p className="mt-1">
                  Votre rôle : <strong>{ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS] ?? profile.role}</strong>
                </p>
                <p className="mt-1 text-xs">
                  Cet espace ne correspond pas à votre profil. Utilisez le bouton ci-dessous pour accéder à votre tableau de bord.
                </p>
              </>
            ) : (
              <p>Votre session a expiré ou vous n'êtes pas connecté.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {dashboardPath && (
              <Button asChild size="lg">
                <Link href={dashboardPath}>
                  <Home className="mr-2 h-4 w-4" />
                  Aller à mon tableau de bord
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Changer de compte
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {APP_NAME} — Si vous pensez qu'il s'agit d'une erreur, contactez votre
        administrateur ou le support au +225 05 76 10 32 77.
      </p>
    </div>
  );
}
