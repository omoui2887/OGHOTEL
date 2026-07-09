import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Hotel,
  LayoutGrid,
  Users,
  BarChart3,
  Star,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth";
import { getRedirectPathForRole } from "@/lib/roles";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export const metadata = {
  title: "Connexion — " + APP_NAME,
};

const MARKETING_POINTS = [
  {
    icon: LayoutGrid,
    title: "Gestion complète",
    desc: "Chambres, réservations, factures — tout au même endroit",
  },
  {
    icon: Users,
    title: "Clients & walk-ins",
    desc: "Check-in rapide et suivi des séjours en temps réel",
  },
  {
    icon: BarChart3,
    title: "Rapports détaillés",
    desc: "Tableau de bord en temps réel et analyses de revenus",
  },
];

export default async function LoginPage() {
  // Si déjà connecté, rediriger
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(getRedirectPathForRole(profile.role));
  }

  return (
    <AuthSplitLayout sidebarVariant="orange">
      {/* === SIDEBAR MARKETING === */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
            La plateforme de gestion hôtelière de référence en Côte d&apos;Ivoire
          </h2>
          <p className="text-base text-white/80">{APP_DESCRIPTION}</p>
        </div>

        {/* Points forts */}
        <ul className="space-y-5">
          {MARKETING_POINTS.map((p) => (
            <li key={p.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <p.icon className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-semibold text-white">{p.title}</p>
                <p className="text-sm text-white/70">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Témoignage */}
        <figure className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm">
          <div className="mb-3 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            ))}
          </div>
          <blockquote className="text-sm leading-relaxed text-white/95">
            «&nbsp;{APP_NAME} a transformé la gestion de notre établissement.
            Simple, rapide et efficace. Le support basé à Abidjan est
            exceptionnel.&nbsp;»
          </blockquote>
          <figcaption className="mt-3 text-xs text-white/70">
            Directeur, Hôtel Le Baobab — Abidjan
          </figcaption>
        </figure>
      </div>

      {/* === CONTENU DROIT — FORMULAIRE === */}
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Connexion
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Entrez vos identifiants pour accéder à votre espace de gestion
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-black/5 sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          {/* Lien inscription */}
          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez un code d&apos;activation ?{" "}
              <Link
                href="/activation"
                className="font-semibold text-primary hover:underline"
              >
                Inscrivez-vous
                <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </p>
          </div>
        </div>

        {/* Badge sécurité */}
        <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          Connexion sécurisée
        </div>

        {/* Retour accueil */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
