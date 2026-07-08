/**
 * Constantes globales de l'application OGHOTEL.
 * Aucune valeur sensible ici — uniquement des informations publiques.
 */

export const APP_NAME = "OGHOTEL";
export const APP_TAGLINE = "Gérez vos hôtels avec excellence";

export const APP_DESCRIPTION =
  "La plateforme de gestion hôtelière n°1 en Côte d'Ivoire. Chambres, réservations, paiements Mobile Money, factures et rapports — en français, en FCFA.";

export const APP_LOCALE = "fr-FR";
export const APP_CURRENCY = "XOF";
export const APP_CURRENCY_LABEL = "FCFA";
export const APP_TIMEZONE = "Africa/Abidjan";

export const WHATSAPP_CONTACT = "+225057610327";
export const WHATSAPP_DISPLAY = "+225 05 76 10 32 77";
export const SUPPORT_EMAIL = "ogouromain@gmail.com";

// Navigation header
export const NAV_LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#produit", label: "Produit" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#temoignages", label: "Témoignages" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const AUTH_NAV_LINKS = [{ href: "/login", label: "Connexion" }] as const;

// Hero
export const HERO_BADGE = "#1 en Côte d'Ivoire";
export const HERO_TITLE_WHITE = "Gérez vos hôtels";
export const HERO_TITLE_ORANGE = "avec excellence";
export const HERO_DESCRIPTION =
  "La plateforme de gestion hôtelière conçue spécifiquement pour les hôtels et résidences de Côte d'Ivoire. Simple, puissante et adaptée à votre marché.";
export const HERO_KEY_POINTS = [
  { icon: "layout-grid", title: "Gestion simplifiée" },
  { icon: "clock", title: "Temps réel" },
  { icon: "smartphone", title: "Mobile & Web" },
];
export const HERO_STATS = [
  { value: "500+", label: "Hôtels", icon: "building", color: "orange" },
  { value: "+45%", label: "Revenus", icon: "trending-up", color: "green" },
];

// 4 fonctionnalités principales (Image2)
export const MAIN_FEATURES = [
  { icon: "calendar", color: "blue", title: "Gestion des Réservations", desc: "Calendrier intelligent avec gestion en temps réel des disponibilités, check-in/check-out automatisé." },
  { icon: "users", color: "pink", title: "Gestion des Clients", desc: "CRM intégré pour suivre vos clients, leurs préférences et historique de séjours complets." },
  { icon: "bar-chart", color: "green", title: "Analyses & Rapports", desc: "Tableaux de bord en temps réel, KPIs hôteliers, taux d'occupation et prévisions de revenus." },
  { icon: "wallet", color: "orange", title: "Paiements Intégrés", desc: "Acceptez Mobile Money, Orange Money, Wave et cartes bancaires directement sur la plateforme." },
];

// 8 fonctionnalités secondaires (Image3)
export const SECONDARY_FEATURES = [
  { icon: "bell", color: "orange", title: "Notifications Smart", desc: "Alertes automatiques pour les arrivées, départs, paiements et avis clients par SMS et email." },
  { icon: "shield", color: "blue", title: "Sécurité Renforcée", desc: "Protection des données conformes aux normes internationales, sauvegarde automatique quotidienne." },
  { icon: "globe", color: "green", title: "Multi-Propriétés", desc: "Gérez plusieurs hôtels depuis un seul tableau de bord centralisé, partout en Côte d'Ivoire." },
  { icon: "smartphone", color: "purple", title: "Application Mobile", desc: "Gérez votre hôtel depuis votre téléphone, où que vous soyez, à tout moment." },
  { icon: "sparkles", color: "yellow", title: "Automatisation", desc: "Automatisez les tâches répétitives : factures, confirmations, rappels et rapports." },
  { icon: "clock", color: "pink", title: "Gestion du Personnel", desc: "Planification des équipes, gestion des shifts et suivi des performances du staff." },
  { icon: "book", color: "blue", title: "Gestion des Chambres", desc: "Types de chambres, tarification dynamique, maintenance et inventaire centralisés." },
  { icon: "headset", color: "green", title: "Support 24/7", desc: "Équipe d'assistance dédiée basée à Abidjan, disponible en français 24h/24 et 7j/7." },
];

// Section résultats (Image5/6)
export const RESULTS_SECTION = {
  titleWhite: "Des résultats",
  titleOrange: "qui parlent d'eux-mêmes",
  subtitle: "Nos clients constatent des améliorations significatives dès les premières semaines d'utilisation.",
  cardIcon: "trending-up",
  cardTitle: "Augmentez vos revenus de 45%",
  cardDesc: "Optimisez votre taux d'occupation grâce à la tarification dynamique et aux analyses prédictives. Maximisez chaque chambre.",
  cardCta: "Découvrir comment",
};

// Tarifs
export type Plan = {
  id: "essentiel" | "privilege" | "premium";
  name: string;
  priceFcfa: number;
  priceLabel: string;
  period: string;
  target: string;
  highlighted?: boolean;
  badge?: string;
  summary: string;
  features: string[];
};

export const PLANS: Plan[] = [
  { id: "essentiel", name: "Essentiel", priceFcfa: 30000, priceLabel: "30 000 FCFA", period: "an", target: "Petite résidence, auberge, petit hôtel", summary: "L'essentiel pour digitaliser la gestion de votre établissement.", features: ["1 établissement","1 utilisateur Admin","Chambres & réservations","Clients hébergés","Paiements & facturation simple","Statistiques de base"] },
  { id: "privilege", name: "Privilège", priceFcfa: 50000, priceLabel: "50 000 FCFA", period: "an", target: "Hôtel ou résidence de taille moyenne", highlighted: true, badge: "Le plus choisi", summary: "La formule complète pour piloter toute votre activité hôtelière.", features: ["Tout Essentiel","Jusqu'à 3 comptes personnel","Dépenses, ménage, maintenance","Rapports avancés","Exports CSV / PDF","Support prioritaire"] },
  { id: "premium", name: "Premium", priceFcfa: 75000, priceLabel: "75 000 FCFA", period: "an", target: "Groupe, grande résidence, multi-sites", summary: "Pour les groupes et multi-sites, sans limite d'utilisateurs.", features: ["Tout Privilège","Multi-établissements","Utilisateurs illimités","Exports comptables avancés","Assistance dédiée"] },
];

// FAQ (Image7)
export const FAQ_ITEMS = [
  { q: "Comment fonctionne l'essai gratuit ?", a: "Vous pouvez tester OGHOTEL gratuitement pendant 14 jours, sans carte bancaire. À l'issue de cette période, vous choisissez la formule qui vous convient. Toutes vos données sont conservées si vous souscrivez un abonnement." },
  { q: "Est-ce que OGHOTEL fonctionne avec Mobile Money ?", a: "Oui, absolument. OGHOTEL supporte Orange Money, MTN Mobile Money, Moov Money, Wave, les espèces et les virements bancaires. Vous pouvez enregistrer tous les paiements reçus de vos clients, quel que soit le moyen utilisé." },
  { q: "Puis-je gérer plusieurs hôtels depuis un seul compte ?", a: "Oui, avec la formule Premium. Vous gérez plusieurs établissements depuis un tableau de bord centralisé, avec des rapports consolidés. Chaque établissement garde ses propres données, isolées et sécurisées." },
  { q: "Quelle formation est disponible ?", a: "Une formation de prise en main est incluse avec tous les abonnements. Notre équipe basée à Abidjan vous accompagne par WhatsApp et par téléphone. Des tutoriels vidéo et une documentation en français sont également disponibles." },
  { q: "Est-ce que mes données sont sécurisées ?", a: "Oui. Chaque établissement est strictement isolé : vos données ne sont jamais visibles par un autre hôtel. L'accès est protégé par mot de passe, les actions sensibles sont tracées, et des sauvegardes automatiques sont effectuées quotidiennement." },
];

export const BUSINESS_TYPES = [
  { value: "hotel", label: "Hôtel" },
  { value: "residence", label: "Résidence meublée" },
  { value: "auberge", label: "Auberge" },
  { value: "autre", label: "Autre" },
] as const;

export const DESIRED_PLAN_OPTIONS = [
  { value: "essentiel", label: "Essentiel — 30 000 FCFA/an" },
  { value: "privilege", label: "Privilège — 50 000 FCFA/an" },
  { value: "premium", label: "Premium — 75 000 FCFA/an" },
  { value: "indecis", label: "Je ne sais pas encore" },
] as const;
