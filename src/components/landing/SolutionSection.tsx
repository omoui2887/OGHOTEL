import {
  BedDouble,
  CalendarCheck,
  Wallet,
  FileText,
  BarChart3,
  Smartphone,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

const WORKFLOW_STEPS = [
  "Chambre",
  "Réservation",
  "Check-in",
  "Paiement",
  "Reçu",
  "Rapport",
];

const BENEFITS: { icon: LucideIcon; title: string }[] = [
  { icon: BedDouble, title: "Suivez vos chambres en temps réel" },
  { icon: CalendarCheck, title: "Évitez les doubles réservations" },
  { icon: Wallet, title: "Enregistrez paiements, acomptes et soldes" },
  { icon: FileText, title: "Générez des reçus et factures professionnels" },
  { icon: BarChart3, title: "Consultez vos rapports d'activité" },
  { icon: Smartphone, title: "Gérez votre établissement depuis un téléphone" },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function SolutionSection() {
  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="bg-[#F8F6F0] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#D4A843]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#B08A2C]">
            La solution
          </span>
          <h2
            id="solution-title"
            className="mt-4 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl md:text-5xl"
          >
            OGHOTEL{" "}
            <span className="font-serif italic text-[#D4A843]">transforme</span>{" "}
            votre gestion quotidienne
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Avec OGHOTEL, votre établissement passe d&rsquo;une gestion manuelle
            dispersée à une organisation claire, centralisée et professionnelle.
          </p>
        </div>

        {/* Workflow */}
        <div className="mt-14 sm:mt-16">
          <ol className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-1">
            {WORKFLOW_STEPS.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-3 sm:gap-1"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-[#D4A843]/25 bg-white px-4 py-3 shadow-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#D4A843] text-sm font-bold text-[#0B1F3A]">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#0B1F3A]">
                    {step}
                  </span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight
                    className="size-5 shrink-0 rotate-90 text-[#D4A843] sm:rotate-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Benefit cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <article
              key={benefit.title}
              className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#D4A843]/15 text-[#D4A843] transition-colors group-hover:bg-[#D4A843] group-hover:text-white">
                <benefit.icon className="size-6" aria-hidden="true" />
              </span>
              <p className="pt-1 text-base font-medium leading-snug text-[#0B1F3A]">
                {benefit.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SolutionSection;
