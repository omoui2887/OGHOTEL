import {
  CalendarX,
  AlertTriangle,
  Eye,
  Wallet,
  FileText,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Section problèmes — landing OGHOTEL.
 * Fond bleu marine (#0B1F3A), 6 cartes avec icône Lucide dans cercle doré.
 *
 * Server component (pas de "use client").
 */

type Problem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const PROBLEMS: Problem[] = [
  {
    icon: CalendarX,
    title: "Réservations dispersées",
    desc: "Entre cahier, appels et WhatsApp",
  },
  {
    icon: AlertTriangle,
    title: "Risque de double réservation",
    desc: "La même chambre réservée deux fois",
  },
  {
    icon: Eye,
    title: "Disponibilité difficile à suivre",
    desc: "Quelles chambres sont libres ?",
  },
  {
    icon: Wallet,
    title: "Paiements mal contrôlés",
    desc: "Acomptes et soldes perdus de vue",
  },
  {
    icon: FileText,
    title: "Reçus manuels",
    desc: "Factures faites à la main",
  },
  {
    icon: BarChart3,
    title: "Pas de rapports",
    desc: "Revenus et occupation inconnus",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-[#0B1F3A] py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Les difficultés que rencontrent les{" "}
            <span className="font-serif italic text-[#D4A843]">
              hôtels et résidences
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
            Avant OGHOTEL, la majorité des établissements ivoiriens jonglent
            entre plusieurs outils imparfaits — et subissent les conséquences
            au quotidien.
          </p>
        </div>

        {/* Grille de 6 cartes */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D4A843]/15 text-[#D4A843]">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                {p.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
