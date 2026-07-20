import Link from "next/link";
import { Check, Star, Building2, Hotel, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PlanId = "ESSENTIEL" | "PRIVILEGE" | "PREMIUM";

type Plan = {
  id: PlanId;
  name: string;
  priceLabel: string;
  target: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  icon: typeof Building2;
};

const PLANS: Plan[] = [
  {
    id: "ESSENTIEL",
    name: "Essentiel",
    priceLabel: "30 000 FCFA",
    target: "Petites résidences, auberges, petits hôtels",
    icon: Building2,
    features: [
      "1 établissement",
      "1 utilisateur Admin",
      "Gestion des chambres",
      "Réservations",
      "Clients",
      "Paiements",
      "Reçu / facture simple",
      "Statistiques de base",
    ],
  },
  {
    id: "PRIVILEGE",
    name: "Privilège",
    priceLabel: "50 000 FCFA",
    target: "Hôtels et résidences de taille moyenne",
    icon: Hotel,
    highlighted: true,
    badge: "Recommandé",
    features: [
      "Tout Essentiel",
      "Jusqu'à 3 comptes",
      "Rapports avancés",
      "Dépenses",
      "Ménage",
      "Maintenance",
      "Exports CSV / PDF",
      "Support prioritaire",
    ],
  },
  {
    id: "PREMIUM",
    name: "Premium",
    priceLabel: "75 000 FCFA",
    target: "Grandes structures, groupes ou multi-sites",
    icon: Layers,
    features: [
      "Tout Privilège",
      "Multi-établissement",
      "Utilisateurs illimités",
      "Exports comptables",
      "Assistance dédiée",
    ],
  },
];

function ctaHref(planId: PlanId): string {
  return `/?plan=${planId}#lead-form`;
}

export function PricingSection() {
  return (
    <section
      id="tarifs"
      aria-labelledby="pricing-title"
      className="bg-[#F8F6F0] py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8a6a1f]">
            Tarifs
          </span>
          <h2
            id="pricing-title"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] md:text-4xl lg:text-5xl"
          >
            <span className="font-serif italic">Des tarifs simples</span>, adaptés
            à votre structure
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Un paiement mensuel clair, en FCFA. Aucun frais caché. Choisissez la
            formule qui correspond à la taille de votre établissement.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isFeatured = !!plan.highlighted;

            return (
              <article
                key={plan.id}
                className={[
                  "relative flex h-full flex-col rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 md:p-8",
                  isFeatured
                    ? "border-2 border-[#D4A843] shadow-2xl shadow-[#D4A843]/20 lg:-mt-4 lg:mb-4"
                    : "border border-slate-200 hover:-translate-y-1 hover:shadow-xl",
                ].join(" ")}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#D4A843] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] hover:bg-[#D4A843]">
                      <Star className="mr-1 h-3 w-3 fill-[#0B1F3A] text-[#0B1F3A]" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                      isFeatured
                        ? "bg-[#D4A843]/15 text-[#D4A843]"
                        : "bg-[#0B1F3A]/5 text-[#0B1F3A]",
                    ].join(" ")}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F3A]">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{plan.target}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 border-b border-slate-100 pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-bold text-[#0B1F3A]">
                      {plan.priceLabel}
                    </span>
                    <span className="text-sm text-slate-500">/an</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Paiement mensuel · Activation immédiate
                  </p>
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-3" role="list">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <span
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          isFeatured
                            ? "bg-[#D4A843] text-[#0B1F3A]"
                            : "bg-[#16A34A]/10 text-[#16A34A]",
                        ].join(" ")}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={ctaHref(plan.id)}
                  data-plan={plan.id}
                  className={[
                    "mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl px-6 text-sm font-semibold transition-all duration-200",
                    isFeatured
                      ? "bg-[#D4A843] text-[#0B1F3A] hover:bg-[#c2993a] hover:shadow-lg hover:shadow-[#D4A843]/30"
                      : "bg-[#0B1F3A] text-white hover:bg-[#0B1F3A]/90",
                  ].join(" ")}
                  aria-label={`Choisir la formule ${plan.name}`}
                >
                  Choisir {plan.name}
                </Link>
              </article>
            );
          })}
        </div>

        {/* Helper note */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
          Besoin d&apos;aide pour choisir ?{" "}
          <a
            href="https://wa.me/225057610327"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0B1F3A] underline decoration-[#D4A843] decoration-2 underline-offset-2 hover:text-[#D4A843]"
          >
            Contactez-nous sur WhatsApp
          </a>{" "}
          — nous vous conseillons selon votre taille.
        </p>
      </div>
    </section>
  );
}
