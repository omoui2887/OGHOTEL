/**
 * Constantes globales de l'application OGHOTEL.
 * Aucune valeur sensible ici — uniquement des informations publiques.
 */

export const APP_NAME = "OGHOTEL";
export const APP_TAGLINE =
  "Gérez votre hôtel ou résidence simplement, depuis une seule interface.";

export const APP_DESCRIPTION =
  "SaaS de gestion d'hôtels et résidences meublées pour la Côte d'Ivoire. Chambres, réservations, paiements Mobile Money, factures et rapports — en français, en FCFA.";

export const APP_LOCALE = "fr-FR";
export const APP_CURRENCY = "XOF"; // FCFA — ISO 4217
export const APP_CURRENCY_LABEL = "FCFA";
export const APP_TIMEZONE = "Africa/Abidjan";

// Contact commercial public (PRD §23).
export const WHATSAPP_CONTACT = "+225057610327"; // format international sans +
export const WHATSAPP_DISPLAY = "+225 05 76 10 32 77";
export const SUPPORT_EMAIL = "ogouromain@gmail.com";

// Formules d'abonnement (PRD §9).
export const PLANS = [
  {
    id: "essentiel",
    name: "Essentiel",
    priceFcfa: 30000,
    priceLabel: "30 000 FCFA",
    period: "an",
    target: "Petite résidence, auberge, petit hôtel",
    features: [
      "1 établissement",
      "1 utilisateur Admin",
      "Chambres & réservations",
      "Clients hébergés",
      "Paiements & facturation simple",
      "Statistiques de base",
    ],
  },
  {
    id: "privilege",
    name: "Privilège",
    priceFcfa: 50000,
    priceLabel: "50 000 FCFA",
    period: "an",
    target: "Hôtel ou résidence de taille moyenne",
    features: [
      "Tout Essentiel",
      "Jusqu'à 3 comptes personnel",
      "Dépenses, ménage, maintenance",
      "Rapports avancés",
      "Exports CSV / PDF",
      "Support prioritaire",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    priceFcfa: 75000,
    priceLabel: "75 000 FCFA",
    period: "an",
    target: "Groupe, grande résidence, multi-sites",
    features: [
      "Tout Privilège",
      "Multi-établissements",
      "Utilisateurs illimités",
      "Exports comptables avancés",
      "Assistance dédiée",
    ],
  },
] as const;

export const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
] as const;

export const AUTH_NAV_LINKS = [
  { href: "/login", label: "Connexion" },
] as const;
