import Link from "next/link";
import { Hotel, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
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
        <CardContent className="space-y-4">
          {/* Formulaire temporaire — pas d'action Supabase pour l'instant */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.ci"
              autoComplete="email"
              disabled
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled
            />
          </div>
          <Button className="w-full" disabled>
            Se connecter
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              ou
            </span>
          </div>

          <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            <ShieldCheck className="mx-auto mb-1 h-4 w-4" />
            Authentification Supabase — sera activée à l'étape 6.
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/#contact" className="font-medium text-primary hover:underline">
              Demander une démo
            </Link>
          </div>
        </CardContent>
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
