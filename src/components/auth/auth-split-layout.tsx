import * as React from "react";
import Link from "next/link";
import { Hotel } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

/**
 * Layout 2 colonnes pour les pages d'authentification.
 * Adapté du modèle OGHOTEL :
 *  - Colonne gauche : sidebar marketing (orange) ou navigation par étapes (navy)
 *  - Colonne droite : contenu principal (formulaire)
 *
 * Sur mobile (lg < 1024px), la sidebar est masquée et seul le contenu s'affiche.
 */
export function AuthSplitLayout({
  sidebar,
  children,
  sidebarVariant = "orange",
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarVariant?: "orange" | "navy";
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar gauche — masquée sur mobile */}
      <aside
        className={[
          "relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden lg:flex",
          sidebarVariant === "orange"
            ? "bg-gradient-to-br from-primary via-primary to-orange-700 text-white"
            : "bg-gradient-to-br from-orange-600 via-primary to-orange-800 text-white",
        ].join(" ")}
      >
        {/* Texture décorative */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow décoratif */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        {/* Logo en haut */}
        <div className="relative z-10 p-8 lg:p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
              <Hotel className="h-5 w-5 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Contenu de la sidebar */}
        <div className="relative z-10 flex-1 px-8 lg:px-10">{sidebar}</div>

        {/* Footer sidebar */}
        <div className="relative z-10 p-8 text-xs text-white/60 lg:p-10">
          © {new Date().getFullYear()} {APP_NAME} — Gestion Hôtelière, Côte d&apos;Ivoire
        </div>
      </aside>

      {/* Contenu droit */}
      <main className="flex flex-1 flex-col bg-background">
        {/* Mobile header (logo visible sur mobile) */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
