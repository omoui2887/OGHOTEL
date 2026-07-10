import {
  FileText,
  MessageCircle,
  CreditCard,
  KeyRound,
  Rocket,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                       */
/* -------------------------------------------------------------------------- */

interface Step {
  icon: LucideIcon;
  title: string;
}

const STEPS: Step[] = [
  {
    icon: FileText,
    title: "Vous remplissez le formulaire de demande",
  },
  {
    icon: MessageCircle,
    title: "OGHOTEL vous contacte par WhatsApp ou appel",
  },
  {
    icon: CreditCard,
    title: "Vous choisissez votre formule et payez par Mobile Money",
  },
  {
    icon: KeyRound,
    title: "Vous recevez un code d'activation unique",
  },
  {
    icon: Rocket,
    title: "Vous créez votre compte et commencez à gérer",
  },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function HowItWorksSection() {
  return (
    <section
      id="demarrage"
      aria-labelledby="how-it-works-title"
      className="bg-[#0B1F3A] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
            Démarrage
          </span>
          <h2
            id="how-it-works-title"
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Comment démarrer avec{" "}
            <span className="text-[#D4A843]">OGHOTEL</span> ?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            Cinq étapes simples, et vous êtes prêt à gérer votre établissement
            comme un professionnel.
          </p>
        </div>

        {/* Desktop timeline (md+) */}
        <ol className="relative mt-16 hidden md:grid md:grid-cols-5 md:gap-4">
          {/* Horizontal connecting line */}
          <span
            className="absolute left-[10%] right-[10%] top-7 h-0.5 bg-[#D4A843]/30"
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative flex flex-col items-center px-2 text-center"
            >
              <div className="relative z-10 flex size-14 items-center justify-center rounded-full bg-[#D4A843] text-xl font-bold text-[#0B1F3A] ring-8 ring-[#0B1F3A]">
                {i + 1}
              </div>
              <step.icon
                className="mt-4 size-5 text-[#D4A843]"
                aria-hidden="true"
              />
              <h3 className="mt-2 text-sm font-semibold leading-snug text-white">
                {step.title}
              </h3>
            </li>
          ))}
        </ol>

        {/* Mobile timeline (vertical) */}
        <ol className="mt-12 space-y-6 md:hidden">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4">
              {i < STEPS.length - 1 && (
                <span
                  className="absolute bottom-0 left-7 top-16 w-0.5 bg-[#D4A843]/30"
                  aria-hidden="true"
                />
              )}
              <div className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full bg-[#D4A843] text-xl font-bold text-[#0B1F3A]">
                {i + 1}
              </div>
              <div className="pt-3">
                <div className="flex items-center gap-2">
                  <step.icon
                    className="size-4 text-[#D4A843]"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4A843]">
                    Étape {i + 1}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-white">
                  {step.title}
                </h3>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA */}
        <div className="mt-14 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4A843] px-6 py-3 text-sm font-semibold text-[#0B1F3A] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#C99836] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1F3A]"
          >
            <Rocket className="size-4" aria-hidden="true" />
            Démarrer maintenant
          </a>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
