import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Section héros — landing OGHOTEL.
 * Fond bleu marine (#0B1F3A) + lueur radiale dorée discrète.
 * Maquette HTML/CSS d'un tableau de bord OGHOTEL à droite.
 *
 * Server component (pas de "use client").
 */

const WHATSAPP_URL = "https://wa.me/2250576103277";

type StatCardProps = {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
};

function StatCard({ label, value, suffix, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        {suffix ? (
          <span className="text-xs font-medium text-slate-400">{suffix}</span>
        ) : null}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[#16A34A]">{hint}</p>
      ) : null}
    </div>
  );
}

type RoomStatus = "green" | "orange" | "blue" | "amber";

const STATUS_STYLES: Record<RoomStatus, string> = {
  green: "bg-[#16A34A]/15 text-[#16A34A] ring-[#16A34A]/30",
  orange: "bg-[#F97316]/15 text-[#F97316] ring-[#F97316]/30",
  blue: "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
};

const STATUS_LABEL: Record<RoomStatus, string> = {
  green: "Disponible",
  orange: "Occupée",
  blue: "Réservée",
  amber: "Nettoyage",
};

function StatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}

type ReservationRowProps = {
  name: string;
  room: string;
  dates: string;
  status: RoomStatus;
};

function ReservationRow({ name, room, dates, status }: ReservationRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#D4A843]/15 text-xs font-semibold text-[#D4A843]">
          {name
            .split(" ")
            .map((p) => p.charAt(0))
            .slice(0, 2)
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{name}</p>
          <p className="text-[11px] text-slate-400">
            Chambre {room} · {dates}
          </p>
        </div>
      </div>
      <StatusBadge status={status} />
    </li>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1F3A]">
      {/* Lueur radiale dorée */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 25% 0%, rgba(212,168,67,0.20), transparent 60%), radial-gradient(ellipse 55% 50% at 85% 25%, rgba(212,168,67,0.10), transparent 70%)",
        }}
      />

      <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* ------------------------------------------------------------ */}
          {/* Colonne gauche — copy                                        */}
          {/* ------------------------------------------------------------ */}
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843]">
              <Sparkles className="h-4 w-4" />
              Solution de gestion pour hôtels &amp; résidences en Côte
              d&apos;Ivoire
            </span>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Gérez votre hôtel ou résidence{" "}
              <span className="font-serif italic text-[#D4A843]">simplement</span>
              , depuis une seule interface.
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-400">
              Centralisez réservations, chambres, paiements Mobile Money et
              rapports — sans cahier ni fichier Excel. Une plateforme claire,
              pensée pour les établissements ivoiriens.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#D4A843] text-[#0B1F3A] hover:bg-[#c39636] hover:text-[#0B1F3A]"
              >
                <a href="#lead-form">
                  Demander une activation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contacter sur WhatsApp
                </a>
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              Paiement Mobile Money · Activation par code · Support WhatsApp ·
              Données sécurisées
            </p>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Colonne droite — maquette tableau de bord                    */}
          {/* ------------------------------------------------------------ */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#D4A843]/20 via-[#D4A843]/5 to-transparent blur-2xl"
            />

            <div className="relative rounded-2xl border border-white/10 bg-[#0B1F3A]/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              {/* En-tête */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#D4A843] text-[10px] font-bold text-[#0B1F3A]">
                      OG
                    </span>
                    <span className="text-sm font-semibold text-white">
                      OGHOTEL · Tableau de bord
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Hôtel Baoulé · Aujourd&apos;hui
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16A34A]/15 px-2.5 py-1 text-[10px] font-medium text-[#16A34A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" aria-hidden />
                  En ligne
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatCard label="Chambres dispo" value="12" hint="sur 28" />
                <StatCard
                  label="Taux d'occupation"
                  value="78%"
                  hint="+5% vs hier"
                />
                <StatCard
                  label="Recettes du jour"
                  value="185 000"
                  suffix="FCFA"
                  hint="+12% vs hier"
                />
                <StatCard label="Arrivées" value="6" hint="2 en attente" />
              </div>

              {/* Réservations récentes */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Réservations récentes
                  </h3>
                  <span className="text-[11px] font-medium text-[#D4A843]">
                    Voir tout →
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  <ReservationRow
                    name="Awa Koné"
                    room="104"
                    dates="12–15 oct."
                    status="blue"
                  />
                  <ReservationRow
                    name="Marc Tanoh"
                    room="208"
                    dates="13–17 oct."
                    status="orange"
                  />
                  <ReservationRow
                    name="Fatou Diallo"
                    room="301"
                    dates="14–16 oct."
                    status="amber"
                  />
                </ul>
              </div>

              {/* Légende statuts chambres */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <StatusBadge status="green" />
                <StatusBadge status="orange" />
                <StatusBadge status="blue" />
                <StatusBadge status="amber" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
