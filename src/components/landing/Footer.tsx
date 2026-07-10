import Link from "next/link";
import { Mail, MessageCircle, KeyRound, LogIn } from "lucide-react";
import {
  APP_NAME,
  SUPPORT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_CONTACT,
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#lead-form", label: "Contact" },
] as const;

export function Footer() {
  const waUrl = buildWhatsAppUrl(
    WHATSAPP_CONTACT,
    `Bonjour, je souhaite des informations sur ${APP_NAME}.`
  );
  const year = new Date().getFullYear();

  return (
    <footer
      aria-labelledby="footer-heading"
      className="relative mt-auto border-t border-white/10 bg-[#07172B] text-slate-300"
    >
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Link
              href="/"
              prefetch
              className="inline-flex items-center gap-2 font-semibold"
              aria-label={`${APP_NAME} — accueil`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A843] text-sm font-bold text-[#0B1F3A]">
                OG
              </span>
              <span className="text-xl font-bold tracking-tight text-[#D4A843]">
                {APP_NAME}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              SaaS de gestion d&apos;hôtels et résidences en Côte d&apos;Ivoire.
            </p>

            {/* Support indicator */}
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#16A34A]/30 bg-[#16A34A]/10 px-3.5 py-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
              </span>
              <span className="text-xs font-medium text-[#16A34A]">
                Support WhatsApp disponible
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Navigation pied de page"
            className="md:col-span-3"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch
                    className="text-slate-300 transition-colors hover:text-[#D4A843]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  prefetch
                  className="inline-flex items-center gap-1.5 text-slate-300 transition-colors hover:text-[#D4A843]"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/activation"
                  prefetch
                  className="inline-flex items-center gap-1.5 text-slate-300 transition-colors hover:text-[#D4A843]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Activer mon compte
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact
            </h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 text-slate-300 transition-colors hover:text-[#D4A843]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#16A34A] transition-colors group-hover:bg-[#16A34A]/15">
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-slate-500">
                      WhatsApp
                    </span>
                    <span className="font-medium">{WHATSAPP_DISPLAY}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="group flex items-start gap-3 text-slate-300 transition-colors hover:text-[#D4A843]"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#D4A843] transition-colors group-hover:bg-[#D4A843]/15">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-slate-500">
                      Email
                    </span>
                    <span className="font-medium break-all">
                      {SUPPORT_EMAIL}
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 md:flex-row">
          <p>© {year} {APP_NAME}. Tous droits réservés.</p>
          <p className="flex items-center gap-1.5">
            Conçu et supporté à Abidjan, Côte d&apos;Ivoire
            <span aria-hidden className="text-[#D4A843]">·</span>
            <span className="font-mono">FCFA</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
