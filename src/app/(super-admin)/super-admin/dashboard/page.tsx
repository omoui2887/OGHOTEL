import Link from "next/link";
import {
  Hotel,
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  LogOut,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

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
import { ROLE_LABELS } from "@/lib/roles";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ExportButton } from "@/components/shared/export-button";

const QUICK_LINKS = [
  { href: "/super-admin/leads", label: "Prospects", icon: Users },
  { href: "/super-admin/payments", label: "Paiements SaaS", icon: CreditCard },
  { href: "/super-admin/activation-codes", label: "Codes d'activation", icon: Ticket },
];

export default async function SuperAdminDashboardPage() {
  // Récupère le profil serveur — si pas connecté, le middleware a déjà
  // redirigé vers /login. On affiche quand même un fallback défensif.
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">Espace Super Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton scope="super-admin" />
            {profile && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile.full_name ?? profile.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Tableau de bord Super Admin
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestion globale de la plateforme {APP_NAME} — prospects, clients,
            paiements SaaS et codes d'activation.
          </p>
        </div>

        {/* Carte statut */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {profile
                  ? `Bienvenue, ${profile.full_name ?? profile.email}`
                  : "Session active"}
              </CardTitle>
            </div>
            <CardDescription>
              {profile
                ? `Rôle : ${ROLE_LABELS[profile.role] ?? profile.role}`
                : "Profil non chargé — l'authentification Supabase sera pleinement active après la création des tables (étape 4)."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Accès rapides (placeholders) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Card key={link.href} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{link.label}</CardTitle>
                    <CardDescription className="text-xs">
                      Module à développer
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={link.href}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Bientôt disponible
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Note */}
        <Card className="mt-8 border-dashed">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                Étape actuelle : intégration Supabase Auth
              </p>
              <p className="mt-1">
                L'authentification est prête. Les modules Super Admin (prospects,
                paiements, codes d'activation) seront développés aux étapes 9 à 12.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
