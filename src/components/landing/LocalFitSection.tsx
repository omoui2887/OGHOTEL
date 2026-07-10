import {
  Coins,
  Smartphone,
  MessageCircle,
  Languages,
  Wifi,
  UserCheck,
  Building2,
  Quote,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const LOCAL_POINTS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Coins,
    title: "Prix en FCFA",
    description: "Tous les montants, tarifs et rapports sont en francs CFA.",
  },
  {
    icon: Smartphone,
    title: "Paiement Mobile Money manuel",
    description: "Orange Money, MTN Money, Wave, espèces : à vous de choisir.",
  },
  {
    icon: MessageCircle,
    title: "Contact WhatsApp direct",
    description: "Une question ? Écrivez-nous directement sur WhatsApp.",
  },
  {
    icon: Languages,
    title: "Interface 100% française",
    description: "Une langue, des termes clairs, zéro jargon technique.",
  },
  {
    icon: Wifi,
    title: "Adapté aux connexions mobiles",
    description: "Léger et rapide, même sur une connexion data modeste.",
  },
  {
    icon: UserCheck,
    title: "Simple pour utilisateurs débutants",
    description: "Aucune connaissance en informatique requise pour démarrer.",
  },
  {
    icon: Building2,
    title: "Hôtels, résidences, auberges",
    description: "Pensé pour tous les types d'hébergement ivoiriens.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function LocalFitSection() {
  return (
    <section
      id="marche-ivoirien"
      aria-labelledby="local-fit-title"
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#D4A843]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#B08A2C]">
            Adaptation locale
          </span>
          <h2
            id="local-fit-title"
            className="mt-4 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl md:text-5xl"
          >
            Pensé pour le{" "}
            <span className="font-serif italic text-[#D4A843]">
              marché ivoirien
            </span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            OGHOTEL n&rsquo;est pas un logiciel traduit : c&rsquo;est un outil
            pensé depuis Abidjan pour les établissements de Côte d&rsquo;Ivoire.
          </p>
        </div>

        {/* Local fit grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOCAL_POINTS.map((point) => (
            <article
              key={point.title}
              className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4A843]/30 hover:shadow-lg"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#D4A843]/15 text-[#D4A843] transition-colors group-hover:bg-[#D4A843] group-hover:text-white">
                <point.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#0B1F3A]">
                  {point.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {point.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Warm quote */}
        <figure className="mx-auto mt-16 max-w-4xl rounded-3xl bg-[#F8F6F0] p-8 sm:p-12">
          <Quote
            className="size-10 text-[#D4A843]"
            aria-hidden="true"
          />
          <blockquote className="mt-4 text-xl font-medium leading-relaxed text-[#0B1F3A] sm:text-2xl">
            «&nbsp;Vous n&rsquo;avez pas besoin d&rsquo;être expert en
            informatique. OGHOTEL a été pensé pour être simple dès la première
            utilisation.&nbsp;»
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#D4A843] text-sm font-bold text-[#0B1F3A]">
              OG
            </span>
            <div>
              <p className="font-semibold text-[#0B1F3A]">L&rsquo;équipe OGHOTEL</p>
              <p className="text-xs">Au service des hôteliers ivoiriens</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default LocalFitSection;
