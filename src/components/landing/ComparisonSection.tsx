import { Check, X } from "lucide-react";

type Feature = {
  label: string;
  essentiel: boolean;
  privilege: boolean;
  premium: boolean;
};

const FEATURES: Feature[] = [
  { label: "Chambres", essentiel: true, privilege: true, premium: true },
  { label: "Réservations", essentiel: true, privilege: true, premium: true },
  { label: "Paiements", essentiel: true, privilege: true, premium: true },
  { label: "Reçus / factures", essentiel: true, privilege: true, premium: true },
  { label: "Statistiques", essentiel: true, privilege: true, premium: true },
  { label: "Dépenses", essentiel: false, privilege: true, premium: true },
  { label: "Personnel", essentiel: false, privilege: true, premium: true },
  { label: "Ménage", essentiel: false, privilege: true, premium: true },
  { label: "Maintenance", essentiel: false, privilege: true, premium: true },
  { label: "Exports", essentiel: false, privilege: true, premium: true },
  { label: "Multi-établissement", essentiel: false, privilege: false, premium: true },
  { label: "Support prioritaire", essentiel: false, privilege: true, premium: true },
];

function StatusCell({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        <span className="sr-only">Inclus</span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
      <X className="h-3.5 w-3.5" strokeWidth={3} />
      <span className="sr-only">Non inclus</span>
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section
      id="comparaison"
      aria-labelledby="comparison-title"
      className="bg-white py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8a6a1f]">
            Comparatif
          </span>
          <h2
            id="comparison-title"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] md:text-4xl lg:text-5xl"
          >
            <span className="font-serif italic">Comparez</span> les formules
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Tout ce que vous obtenez selon la formule choisie. Aucune surprise.
          </p>
        </div>

        {/* Table — overflow-x-auto wrapper for mobile */}
        <div className="mx-auto mt-12 max-w-5xl overflow-x-auto">
          <div className="min-w-[640px] rounded-3xl border border-slate-200 bg-white shadow-lg">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Comparatif des fonctionnalités incluses dans chaque formule
                OGHOTEL
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-white px-6 py-5 text-left align-bottom text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    Fonctionnalité
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-5 text-center align-bottom text-base font-bold text-[#0B1F3A]"
                  >
                    Essentiel
                    <div className="mt-1 font-mono text-xs font-normal text-slate-500">
                      30 000 FCFA
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="rounded-t-3xl bg-[#D4A843]/15 px-4 py-5 text-center align-bottom text-base font-bold text-[#0B1F3A]"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Privilège
                    </span>
                    <div className="mt-1 font-mono text-xs font-normal text-[#8a6a1f]">
                      50 000 FCFA
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-5 text-center align-bottom text-base font-bold text-[#0B1F3A]"
                  >
                    Premium
                    <div className="mt-1 font-mono text-xs font-normal text-slate-500">
                      75 000 FCFA
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feat, idx) => {
                  const isLast = idx === FEATURES.length - 1;
                  return (
                    <tr
                      key={feat.label}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/60"
                    >
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-sm font-medium text-slate-700"
                      >
                        {feat.label}
                      </th>
                      <td
                        className={[
                          "px-4 py-4 text-center",
                          isLast ? "rounded-bl-3xl" : "",
                        ].join(" ")}
                      >
                        <div className="flex justify-center">
                          <StatusCell value={feat.essentiel} />
                        </div>
                      </td>
                      <td className="bg-[#D4A843]/10 px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <StatusCell value={feat.privilege} />
                        </div>
                      </td>
                      <td
                        className={[
                          "px-4 py-4 text-center",
                          isLast ? "rounded-br-3xl" : "",
                        ].join(" ")}
                      >
                        <div className="flex justify-center">
                          <StatusCell value={feat.premium} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#16A34A]/10 text-[#16A34A]">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            Inclus
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <X className="h-3 w-3" strokeWidth={3} />
            </span>
            Non inclus
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#D4A843]/30" />
            Formule recommandée
          </span>
        </div>
      </div>
    </section>
  );
}
