import * as React from "react";
import { KeyRound, Building2, UserCircle2, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

type Step = 1 | 2 | 3;

const STEPS = [
  {
    id: 1 as Step,
    icon: KeyRound,
    title: "Code d'activation",
    desc: "Validez votre licence",
  },
  {
    id: 2 as Step,
    icon: Building2,
    title: "Votre hôtel",
    desc: "Informations de l'établissement",
  },
  {
    id: 3 as Step,
    icon: UserCircle2,
    title: "Votre compte",
    desc: "Identifiants propriétaire",
  },
];

/**
 * Sidebar gauche pour les pages /activation et /register.
 * Affiche les 3 étapes d'inscription avec l'étape active surlignée.
 */
export function RegistrationStepsSidebar({ currentStep }: { currentStep: Step }) {
  return (
    <div className="space-y-8">
      {/* Titre */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
          Rejoignez {APP_NAME}
        </h2>
        <p className="text-base text-white/70">
          Créez votre établissement en quelques étapes et commencez à gérer
          votre hôtel dès aujourd&apos;hui.
        </p>
      </div>

      {/* Carte illustrative */}
      <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/15 backdrop-blur-sm">
        <div className="flex h-20 items-center justify-center rounded-xl bg-white/10">
          <Building2 className="h-10 w-10 text-white/80" />
        </div>
      </div>

      {/* Étapes */}
      <ol className="space-y-5">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          return (
            <li key={step.id} className="flex items-start gap-4">
              <span
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-all",
                  isActive
                    ? "bg-amber-600 text-white ring-amber-600 shadow-lg shadow-amber-600/30"
                    : isDone
                    ? "bg-white/15 text-white ring-white/20"
                    : "bg-white/5 text-white/40 ring-white/10",
                ].join(" ")}
              >
                <step.icon className="h-5 w-5" />
              </span>
              <div className="pt-1">
                <p
                  className={[
                    "font-semibold transition-colors",
                    isActive || isDone ? "text-white" : "text-white/50",
                  ].join(" ")}
                >
                  {step.title}
                </p>
                <p
                  className={[
                    "text-sm transition-colors",
                    isActive || isDone ? "text-white/70" : "text-white/40",
                  ].join(" ")}
                >
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Badge sécurité */}
      <div className="flex items-center gap-2 rounded-xl bg-white/8 px-4 py-3 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
        <ShieldCheck className="h-4 w-4 text-white" />
        Inscription sécurisée — Vos données sont chiffrées
      </div>
    </div>
  );
}

/**
 * Stepper horizontal affiché en haut du formulaire (côté droit).
 */
export function HorizontalStepper({ currentStep }: { currentStep: Step }) {
  const steps = [
    { id: 1 as Step, label: "Code Activation" },
    { id: 2 as Step, label: "Hôtel" },
    { id: 3 as Step, label: "Propriétaire" },
  ];

  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                  isActive
                    ? "bg-[#0c1e3a] text-white shadow-md ring-4 ring-[#0c1e3a]/15"
                    : isDone
                    ? "bg-[#0c1e3a]/80 text-white"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? "✓" : step.id}
              </div>
              <span
                className={[
                  "text-xs font-medium transition-colors",
                  isActive
                    ? "text-[#0c1e3a]"
                    : isDone
                    ? "text-[#0c1e3a]/70"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "mx-1 h-0.5 w-12 rounded-full transition-colors sm:w-20",
                  step.id < currentStep ? "bg-[#0c1e3a]/60" : "bg-border",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
