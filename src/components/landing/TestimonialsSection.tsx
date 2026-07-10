import { Eye, ShieldCheck, Award } from "lucide-react";

type ValueCard = {
  icon: typeof Eye;
  title: string;
  description: string;
};

const VALUES: ValueCard[] = [
  {
    icon: Eye,
    title: "Plus de visibilité",
    description:
      "Vous savez quelles chambres sont libres, occupées, réservées ou à nettoyer.",
  },
  {
    icon: ShieldCheck,
    title: "Moins d'erreurs",
    description:
      "Les réservations, paiements et soldes sont centralisés en un seul endroit.",
  },
  {
    icon: Award,
    title: "Plus de professionnalisme",
    description:
      "Vos reçus, factures et rapports donnent une meilleure image de votre établissement.",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="valeurs"
      aria-labelledby="values-title"
      className="relative overflow-hidden bg-[#0B1F3A] py-20 md:py-28"
    >
      {/* Decorative gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(212,168,67,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-[#D4A843]/10 blur-3xl"
      />

      <div className="container relative mx-auto px-4">
        {/* Title */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
            Valeurs
          </span>
          <h2
            id="values-title"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            Ce que <span className="font-serif italic text-[#D4A843]">OGHOTEL</span>{" "}
            apporte à votre établissement
          </h2>
          <p className="mt-4 text-base text-slate-300 md:text-lg">
            Trois bénéfices concrets pour le quotidien de votre équipe et la
            satisfaction de vos clients.
          </p>
        </div>

        {/* Value cards — glassmorphism */}
        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <article
                key={value.title}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#D4A843]/40 hover:bg-white/[0.07]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4A843]/15 text-[#D4A843] transition-colors group-hover:bg-[#D4A843]/25">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Trust line */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-slate-400">
          Conçu et supporté depuis Abidjan, en français et en FCFA — pensé pour
          les réalités des hôtels et résidences de Côte d&apos;Ivoire.
        </p>
      </div>
    </section>
  );
}
