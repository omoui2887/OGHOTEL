import {
  BedDouble,
  Layers,
  Calendar,
  CalendarCheck,
  LogIn,
  Users,
  Wallet,
  Receipt,
  TrendingDown,
  Sparkles,
  Wrench,
  BarChart3,
  UserCog,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & data                                                               */
/* -------------------------------------------------------------------------- */

type Tier = "Inclus" | "Avancé" | "Premium";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: Tier;
}

const FEATURES: Feature[] = [
  {
    icon: BedDouble,
    title: "Gestion des chambres",
    description: "Suivez l'état et la disponibilité de chaque chambre en temps réel.",
    badge: "Inclus",
  },
  {
    icon: Layers,
    title: "Types de chambres et tarifs",
    description: "Configurez vos catégories de chambres et leurs tarifs en FCFA.",
    badge: "Inclus",
  },
  {
    icon: Calendar,
    title: "Calendrier de disponibilité",
    description: "Visualisez vos disponibilités d'un coup d'œil sur le calendrier.",
    badge: "Inclus",
  },
  {
    icon: CalendarCheck,
    title: "Réservations",
    description: "Créez et gérez les réservations en quelques clics seulement.",
    badge: "Inclus",
  },
  {
    icon: LogIn,
    title: "Check-in / Check-out",
    description: "Enregistrez l'arrivée et le départ de vos clients sans paperasse.",
    badge: "Inclus",
  },
  {
    icon: Users,
    title: "Clients hébergés",
    description: "Centralisez les informations et l'historique de chaque client.",
    badge: "Inclus",
  },
  {
    icon: Wallet,
    title: "Paiements Mobile Money",
    description: "Enregistrez paiements, acomptes et soldes en FCFA.",
    badge: "Inclus",
  },
  {
    icon: Receipt,
    title: "Reçus et factures",
    description: "Générez des documents professionnels automatiquement.",
    badge: "Inclus",
  },
  {
    icon: TrendingDown,
    title: "Dépenses",
    description: "Suivez vos dépenses et maîtrisez votre trésorerie au quotidien.",
    badge: "Avancé",
  },
  {
    icon: Sparkles,
    title: "Ménage",
    description: "Planifiez et suivez le nettoyage de vos chambres.",
    badge: "Avancé",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    description: "Anticipez les interventions et suivez les réparations.",
    badge: "Avancé",
  },
  {
    icon: BarChart3,
    title: "Rapports et statistiques",
    description: "Analysez votre activité avec des rapports clairs et visuels.",
    badge: "Avancé",
  },
  {
    icon: UserCog,
    title: "Personnel et rôles",
    description: "Gérez votre équipe et leurs permissions par rôle.",
    badge: "Premium",
  },
  {
    icon: RefreshCw,
    title: "Abonnement et renouvellement",
    description: "Gérez votre formule et votre renouvellement en toute autonomie.",
    badge: "Premium",
  },
];

const BADGE_STYLES: Record<Tier, string> = {
  Inclus: "bg-[#16A34A]/15 text-[#16A34A]",
  Avancé: "bg-[#D4A843]/15 text-[#D4A843]",
  Premium: "bg-[#F97316]/15 text-[#F97316]",
};

const SWATCH_STYLES: Record<Tier, string> = {
  Inclus: "bg-[#16A34A]",
  Avancé: "bg-[#D4A843]",
  Premium: "bg-[#F97316]",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function FeaturesSection() {
  return (
    <section
      id="fonctionnalites"
      aria-labelledby="features-title"
      className="bg-[#0B1F3A] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
            Fonctionnalités
          </span>
          <h2
            id="features-title"
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Tout ce qu&rsquo;il faut pour{" "}
            <span className="text-[#D4A843]">gérer</span> votre établissement
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            Une suite complète d&rsquo;outils pensés pour les hôtels, résidences
            et auberges de Côte d&rsquo;Ivoire.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#D4A843]/15 text-[#D4A843] transition-colors group-hover:bg-[#D4A843] group-hover:text-[#0B1F3A]">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${BADGE_STYLES[feature.badge]}`}
                >
                  {feature.badge}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white sm:text-base">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400 sm:text-sm">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm">
          {(["Inclus", "Avancé", "Premium"] as Tier[]).map((tier) => (
            <div key={tier} className="flex items-center gap-2 text-slate-300">
              <span
                className={`size-3 rounded-full ${SWATCH_STYLES[tier]}`}
                aria-hidden="true"
              />
              <span>{tier}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
