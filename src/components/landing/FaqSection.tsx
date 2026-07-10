"use client";

import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "q1",
    question: "OGHOTEL fonctionne-t-il pour une résidence meublée ?",
    answer:
      "Oui, OGHOTEL est adapté aux hôtels, résidences meublées, auberges et autres structures d'hébergement.",
  },
  {
    id: "q2",
    question: "Comment se fait le paiement ?",
    answer:
      "Au lancement, le paiement se fait manuellement par Mobile Money ou autre moyen convenu. Après validation, vous recevez un code d'activation.",
  },
  {
    id: "q3",
    question: "Ai-je besoin d'être informaticien ?",
    answer:
      "Non. L'interface est conçue pour être simple, claire et utilisable par un débutant.",
  },
  {
    id: "q4",
    question: "Mes données sont-elles séparées ?",
    answer:
      "Oui. Chaque établissement dispose de son propre espace sécurisé.",
  },
  {
    id: "q5",
    question: "Puis-je créer des comptes pour mon personnel ?",
    answer: "Oui, selon la formule choisie.",
  },
  {
    id: "q6",
    question: "Puis-je utiliser OGHOTEL sur téléphone ?",
    answer:
      "Oui. OGHOTEL est responsive et fonctionne sur téléphone, tablette et ordinateur.",
  },
  {
    id: "q7",
    question: "Que se passe-t-il à l'expiration ?",
    answer:
      "Contactez OGHOTEL pour renouveler. Le Super Admin peut prolonger votre accès après validation du paiement.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-[#0B1F3A] py-20 md:py-28"
    >
      {/* Subtle decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 80% 100%, rgba(212,168,67,0.15), transparent 70%)",
        }}
      />

      <div className="container relative mx-auto px-4">
        {/* Title */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
            <HelpCircle className="h-3.5 w-3.5" />
            Aide
          </span>
          <h2
            id="faq-title"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            Questions <span className="font-serif italic text-[#D4A843]">fréquentes</span>
          </h2>
          <p className="mt-4 text-base text-slate-300 md:text-lg">
            Tout ce que vous devez savoir avant de démarrer avec OGHOTEL.
          </p>
        </div>

        {/* Accordion */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm md:p-4">
            <Accordion
              type="single"
              collapsible
              defaultValue="q1"
              className="w-full"
            >
              {FAQ_ITEMS.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <AccordionTrigger className="px-4 py-5 text-left text-base font-semibold text-white transition-colors hover:text-[#D4A843] hover:no-underline md:text-lg [&[data-state=open]>svg]:text-[#D4A843]">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 text-sm leading-relaxed text-slate-300 md:text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact helper */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Une autre question ?{" "}
            <a
              href="https://wa.me/225057610327"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#D4A843] underline decoration-[#D4A843]/40 underline-offset-2 transition-colors hover:text-[#e6c068]"
            >
              Écrivez-nous sur WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
