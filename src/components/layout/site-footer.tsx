import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import {
  APP_NAME,
  APP_TAGLINE,
  SUPPORT_EMAIL,
  WHATSAPP_DISPLAY,
  WHATSAPP_CONTACT,
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-600 text-sm font-bold text-white">
                OG
              </span>
              <span className="text-lg text-slate-900">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              {APP_TAGLINE}. La plateforme n°1 de gestion hôtelière en Côte d&apos;Ivoire.
            </p>
          </div>

          {/* Spacer / tagline */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-slate-900">À propos</h3>
            <p className="mt-3 text-sm text-slate-500">
              SaaS de gestion hôtelière conçu et supporté depuis Abidjan. Chambres,
              réservations, paiements Mobile Money et rapports — en français, en FCFA.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-500">
              <li>
                <a
                  href={buildWhatsAppUrl(
                    WHATSAPP_CONTACT,
                    `Bonjour, je souhaite des informations sur ${APP_NAME}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-amber-500"
                >
                  <MessageCircle className="h-4 w-4 text-amber-500" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-amber-500"
                >
                  <Mail className="h-4 w-4 text-amber-500" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Navigation</h3>
            <ul className="mt-3 space-y-3 text-sm text-slate-500">
              <li>
                <Link
                  href="/#fonctionnalites"
                  className="transition-colors hover:text-amber-500"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  href="/#tarifs"
                  className="transition-colors hover:text-amber-500"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  prefetch
                  className="transition-colors hover:text-amber-500"
                >
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  href="/activation"
                  prefetch
                  className="transition-colors hover:text-amber-500"
                >
                  Activer mon compte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {year} {APP_NAME}. Tous droits réservés. Abidjan, Côte d&apos;Ivoire.
        </div>
      </div>
    </footer>
  );
}
