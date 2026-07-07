import Link from "next/link";
import { ShieldX, ArrowLeft, LogIn } from "lucide-react";
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
import { getRedirectPathForRole } from "@/lib/roles";

export const metadata = {
  title: "Accès non autorisé",
};

export default async function UnauthorizedPage() {
  // Si l'utilisateur est connecté, on lui propose d'aller vers son dashboard.
  const profile = await getCurrentProfile();
  const dashboardPath = profile
    ? getRedirectPathForRole(profile.role)
    : null;

  return (
    <div className="w-full max-w-md space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Accès non autorisé</CardTitle>
          <CardDescription>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            {profile ? (
              <>
                <p>
                  Connecté en tant que <strong>{profile.full_name ?? profile.email}</strong>
                </p>
                <p className="mt-1">
                  Rôle : <strong>{profile.role}</strong> — cet espace ne correspond
                  pas à votre profil.
                </p>
              </>
            ) : (
              <p>Votre session a expiré ou vous n'êtes pas connecté.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {dashboardPath && (
              <Button asChild>
                <Link href={dashboardPath}>Aller à mon tableau de bord</Link>
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
        administrateur.
      </p>
    </div>
  );
}
