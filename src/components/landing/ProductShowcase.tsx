import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Wallet,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & data                                                               */
/* -------------------------------------------------------------------------- */

interface ShowcaseTab {
  id: string;
  name: string;
  icon: LucideIcon;
}

const SHOWCASE_TABS: ShowcaseTab[] = [
  { id: "dashboard", name: "Tableau de bord", icon: LayoutDashboard },
  { id: "rooms", name: "Chambres", icon: BedDouble },
  { id: "reservations", name: "Réservations", icon: CalendarCheck },
  { id: "payments", name: "Paiements", icon: Wallet },
  { id: "reports", name: "Rapports", icon: BarChart3 },
];

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function WindowFrame({
  tab,
  children,
}: {
  tab: ShowcaseTab;
  children: React.ReactNode;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#F97316]/50" />
          <span className="size-2.5 rounded-full bg-[#D4A843]/50" />
          <span className="size-2.5 rounded-full bg-[#16A34A]/50" />
        </div>
        <div className="ml-2 flex items-center gap-2">
          <tab.icon className="size-3.5 text-[#D4A843]" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-700">
            {tab.name}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4">{children}</div>
    </article>
  );
}

function DashboardPreview() {
  const stats = [
    {
      label: "Occupation",
      value: "78%",
      accent: (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-1.5 w-[78%] rounded-full bg-[#16A34A]" />
        </div>
      ),
    },
    {
      label: "Revenus mois",
      value: "2 450 000",
      suffix: "FCFA",
    },
    { label: "Départs", value: "4" },
    { label: "À nettoyer", value: "5" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-100"
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {s.label}
          </p>
          <p className="mt-0.5 text-base font-bold text-[#0B1F3A]">
            {s.value}
            {s.suffix ? (
              <span className="ml-1 text-[10px] font-medium text-slate-500">
                {s.suffix}
              </span>
            ) : null}
          </p>
          {s.accent}
        </div>
      ))}
    </div>
  );
}

function RoomsPreview() {
  const rooms = [
    { name: "Chambre 101", status: "Occupée", className: "bg-[#F97316]/10 text-[#F97316]" },
    { name: "Chambre 102", status: "Libre", className: "bg-[#16A34A]/10 text-[#16A34A]" },
    { name: "Chambre 103", status: "Nettoyage", className: "bg-[#D4A843]/10 text-[#B08A2C]" },
    { name: "Chambre 104", status: "Maintenance", className: "bg-slate-200 text-slate-600" },
    { name: "Chambre 105", status: "Réservée", className: "bg-[#F97316]/10 text-[#F97316]" },
  ];

  return (
    <ul className="space-y-1.5">
      {rooms.map((r) => (
        <li
          key={r.name}
          className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"
        >
          <span className="text-xs font-semibold text-slate-700">{r.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.className}`}
          >
            {r.status}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReservationsPreview() {
  const rows = [
    { guest: "A. Kouassi", room: "101", dates: "12-14", status: "Confirmée", className: "bg-[#16A34A]/10 text-[#16A34A]" },
    { guest: "M. Diallo", room: "203", dates: "13-15", status: "En attente", className: "bg-[#D4A843]/10 text-[#B08A2C]" },
    { guest: "S. Touré", room: "105", dates: "14-17", status: "Arrivée", className: "bg-[#F97316]/10 text-[#F97316]" },
    { guest: "K. Brou", room: "302", dates: "15-18", status: "Confirmée", className: "bg-[#16A34A]/10 text-[#16A34A]" },
  ];

  return (
    <div className="overflow-hidden">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="text-slate-500">
            <th className="pb-1.5 font-medium">Client</th>
            <th className="pb-1.5 font-medium">Ch.</th>
            <th className="pb-1.5 font-medium">Dates</th>
            <th className="pb-1.5 font-medium">Statut</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {rows.map((r) => (
            <tr key={r.guest} className="border-t border-slate-100">
              <td className="py-1.5 font-medium">{r.guest}</td>
              <td className="py-1.5">{r.room}</td>
              <td className="py-1.5">{r.dates}</td>
              <td className="py-1.5">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${r.className}`}
                >
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsPreview() {
  const payments = [
    { label: "Acompte", method: "Orange Money · 12 mars", amount: "+75 000 F" },
    { label: "Solde", method: "MTN Money · 14 mars", amount: "+120 000 F" },
    { label: "Acompte", method: "Wave · 13 mars", amount: "+50 000 F" },
    { label: "Solde", method: "Espèces · 15 mars", amount: "+45 000 F" },
  ];

  return (
    <ul className="space-y-1.5">
      {payments.map((p, i) => (
        <li
          key={`${p.label}-${i}`}
          className="flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2"
        >
          <div>
            <p className="text-xs font-semibold text-slate-700">{p.label}</p>
            <p className="text-[10px] text-slate-500">{p.method}</p>
          </div>
          <span className="text-xs font-bold text-[#16A34A]">{p.amount}</span>
        </li>
      ))}
    </ul>
  );
}

function ReportsPreview() {
  const bars = [
    { label: "Oct", height: "40%" },
    { label: "Nov", height: "65%" },
    { label: "Déc", height: "55%" },
    { label: "Jan", height: "85%" },
    { label: "Fév", height: "70%" },
    { label: "Mar", height: "60%" },
  ];

  return (
    <div>
      <div className="flex h-24 items-end gap-1.5">
        {bars.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-gradient-to-t from-[#D4A843]/40 to-[#D4A843]"
              style={{ height: b.height }}
            />
            <span className="text-[9px] text-slate-400">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-2.5 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Total 6 mois
        </span>
        <span className="text-xs font-bold text-[#0B1F3A]">14 280 000 F</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProductShowcase() {
  return (
    <section
      id="produit"
      aria-labelledby="showcase-title"
      className="bg-[#F8F6F0] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full bg-[#D4A843]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#B08A2C]">
            Aperçu produit
          </span>
          <h2
            id="showcase-title"
            className="mt-4 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl md:text-5xl"
          >
            Découvrez l&rsquo;interface{" "}
            <span className="font-serif italic text-[#D4A843]">OGHOTEL</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Une interface claire et moderne, conçue pour vous faire gagner du
            temps dès le premier jour.
          </p>
        </div>

        {/* Showcase cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <WindowFrame tab={SHOWCASE_TABS[0]}>
            <DashboardPreview />
          </WindowFrame>
          <WindowFrame tab={SHOWCASE_TABS[1]}>
            <RoomsPreview />
          </WindowFrame>
          <WindowFrame tab={SHOWCASE_TABS[2]}>
            <ReservationsPreview />
          </WindowFrame>
          <WindowFrame tab={SHOWCASE_TABS[3]}>
            <PaymentsPreview />
          </WindowFrame>
          <WindowFrame tab={SHOWCASE_TABS[4]}>
            <ReportsPreview />
          </WindowFrame>
        </div>
      </div>
    </section>
  );
}

export default ProductShowcase;
