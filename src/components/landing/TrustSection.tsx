import {
  MapPin,
  Building2,
  Wallet,
  MessageCircle,
  Languages,
  KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Section signaux de confiance — landing OGHOTEL.
 * Fond ivoire (#F8F6F0), 6 badges + ligne centrale.
 *
 * Server component (pas de "use client").
 */

type TrustBadge = {
  icon: LucideIcon;
  title: string;
};

const TRUST_BADGES: TrustBadge[] = [
  { icon: MapPin, title: "Pensé pour la Côte d'Ivoire" },
  { icon: Building2, title: "Adapté aux hôtels, résidences et auberges" },
  { icon: Wallet, title: "Compatible Mobile Money manuel" },
  { icon: MessageCircle, title: "Support WhatsApp" },
  { icon: Languages, title: "Interface simple en français" },
  { icon: KeyRound, title: "Activation sécurisée par code" },
];

export function TrustSection() {
  return (
    <section className="bg-[#F8F6F0] py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Grille de 6 badges */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3.5 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#D4A843]/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4A843]/15 text-[#D4A843]">
                <badge.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium leading-snug text-[#334155]">
                {badge.title}
              </span>
            </div>
          ))}
        </div>

        {/* Ligne centrale */}
        <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-[#334155] md:text-lg">
          Conçu pour aider les établissements à remplacer les cahiers, fichiers
          Excel et suivis WhatsApp dispersés par une gestion claire et
          centralisée.
        </p>
      </div>
    </section>
  );
}
