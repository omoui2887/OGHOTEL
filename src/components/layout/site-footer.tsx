import Link from "next/link";
import { Hotel, Mail, MessageCircle } from "lucide-react";
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
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Hotel className="h-5 w-5" />
              </span>
              <span className="text-lg">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              {APP_TAGLINE}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              SaaS de gestion hôtelière conçu pour la Côte d'Ivoire.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={buildWhatsAppUrl(WHATSAPP_CONTACT, `Bonjour, je souhaite des informations sur ${APP_NAME}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          {/* Liens */}
          <div>
            <h3 className="text-sm font-semibold">Navigation</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#fonctionnalites" className="transition-colors hover:text-foreground">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/#tarifs" className="transition-colors hover:text-foreground">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/activation" className="transition-colors hover:text-foreground">
                  Activer mon compte
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {year} {APP_NAME}. Tous droits réservés. Abidjan, Côte d'Ivoire.
        </div>
      </div>
    </footer>
  );
}
