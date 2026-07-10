import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";
import { WHATSAPP_CONTACT } from "@/lib/constants";

export function FinalCtaSection() {
  const waUrl = buildWhatsAppUrl(
    WHATSAPP_CONTACT,
    "Bonjour, je souhaite activer mon espace OGHOTEL."
  );

  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative overflow-hidden bg-[#0B1F3A] py-20 md:py-28"
    >
      {/* Gold radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(212,168,67,0.22), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4A843]/10 blur-3xl"
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4A843]">
            Démarrer
          </span>

          <h2
            id="final-cta-title"
            className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            <span className="font-serif italic">
              Prêt à digitaliser la gestion
            </span>{" "}
            de votre établissement ?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
            Envoyez votre demande maintenant et recevez un accompagnement pour
            activer votre espace OGHOTEL.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/?plan=PRIVILEGE#lead-form"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#D4A843] px-8 text-sm font-semibold text-[#0B1F3A] transition-all duration-200 hover:bg-[#c2993a] hover:shadow-lg hover:shadow-[#D4A843]/30 sm:w-auto"
              aria-label="Demander une activation"
            >
              Demander une activation
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/30 bg-transparent px-8 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/50 sm:w-auto"
              aria-label="Contacter sur WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              Contacter sur WhatsApp
            </a>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-sm text-slate-400">
            Sans engagement · Réponse sous 24h · Paiement Mobile Money accepté
          </p>
        </div>
      </div>
    </section>
  );
}
