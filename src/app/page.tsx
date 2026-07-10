import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowRight,
  Play,
  LayoutGrid,
  Clock,
  Smartphone,
  Building,
  TrendingUp,
  Calendar,
  Users,
  BarChart3,
  Wallet,
  Bell,
  Shield,
  Globe,
  Sparkles,
  Book,
  Headset,
  HelpCircle,
  Check,
  MessageCircle,
  Mail,
  ShieldCheck,
  Receipt,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LeadForm } from "@/components/marketing/lead-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  APP_NAME,
  HERO_BADGE,
  HERO_TITLE_WHITE,
  HERO_TITLE_ORANGE,
  HERO_DESCRIPTION,
  HERO_KEY_POINTS,
  HERO_STATS,
  MAIN_FEATURES,
  SECONDARY_FEATURES,
  RESULTS_SECTION,
  PLANS,
  FAQ_ITEMS,
  NAV_LINKS,
  WHATSAPP_CONTACT,
  WHATSAPP_DISPLAY,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                    */
/* -------------------------------------------------------------------------- */

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid,
  clock: Clock,
  smartphone: Smartphone,
  building: Building,
  "trending-up": TrendingUp,
  calendar: Calendar,
  users: Users,
  "bar-chart": BarChart3,
  wallet: Wallet,
  bell: Bell,
  shield: Shield,
  globe: Globe,
  sparkles: Sparkles,
  book: Book,
  headset: Headset,
};

const COLOR_CLASSES: Record<string, string> = {
  orange: "bg-amber-600/15 text-amber-500",
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-green-500/15 text-green-400",
  pink: "bg-pink-500/15 text-pink-400",
  purple: "bg-purple-500/15 text-purple-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* ----------------------------------------------------------------- */}
      {/* HERO                                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 0%, rgba(255,107,53,0.18), transparent 70%)",
          }}
        />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {HERO_BADGE}
              </span>

              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-slate-900">{HERO_TITLE_WHITE}</span>
                <br />
                <span className="text-amber-600">{HERO_TITLE_ORANGE}</span>
              </h1>

              <p className="max-w-xl text-lg text-slate-600">
                {HERO_DESCRIPTION}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  <Link href="/#contact">
                    Commencer Gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Link href="/#produit">
                    <Play className="mr-2 h-4 w-4" />
                    Voir la démo
                  </Link>
                </Button>
              </div>

              {/* Key points */}
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                {HERO_KEY_POINTS.map((point) => {
                  const Icon = ICON_MAP[point.icon] ?? Star;
                  return (
                    <li
                      key={point.title}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/15 text-amber-500">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{point.title}</span>
                    </li>
                  );
                })}
              </ul>

              {/* Stats */}
              <div className="grid max-w-md grid-cols-2 gap-4 pt-4">
                {HERO_STATS.map((stat) => {
                  const Icon = ICON_MAP[stat.icon] ?? Building;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-slate-200 bg-slate-100 p-4"
                    >
                      <Icon className="mb-2 h-5 w-5 text-amber-500" />
                      <div className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — hotel lobby image */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
                <Image
                  src="/images/hotel-lobby-1.png"
                  alt="Lobby d'hôtel moderne et lumineux"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-amber-600/30 bg-white/90 p-4 shadow-lg backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      +45% de revenus
                    </div>
                    <div className="text-xs text-slate-500">
                      en moyenne dès le 1er mois
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* FONCTIONNALITÉS (MAIN)                                             */}
      {/* ----------------------------------------------------------------- */}
      <section id="fonctionnalites" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              Fonctionnalités
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Fonctionnalités Puissantes
            </h2>
            <p className="mt-4 text-slate-500">
              Tout ce dont vous avez besoin pour piloter votre établissement, dans
              une interface simple en français et en FCFA.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MAIN_FEATURES.map((feature) => {
              const Icon = ICON_MAP[feature.icon] ?? Sparkles;
              const colorClass =
                COLOR_CLASSES[feature.color] ?? COLOR_CLASSES.orange;
              return (
                <Card
                  key={feature.title}
                  className="border-slate-200 bg-white transition-colors hover:border-amber-600/40 hover:bg-slate-50"
                >
                  <CardContent className="space-y-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* PRODUIT (SECONDARY FEATURES)                                       */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="produit"
        className="border-y border-slate-200 bg-slate-50 py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Produit
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-slate-500">
              Une suite complète pour gérer chaque aspect de votre activité
              hôtelière, du check-in aux rapports financiers.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SECONDARY_FEATURES.map((feature) => {
              const Icon = ICON_MAP[feature.icon] ?? Sparkles;
              const colorClass =
                COLOR_CLASSES[feature.color] ?? COLOR_CLASSES.orange;
              return (
                <Card
                  key={feature.title}
                  className="border-slate-200 bg-white transition-colors hover:border-amber-600/40"
                >
                  <CardContent className="space-y-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* TÉMOIGNAGES / RÉSULTATS                                            */}
      {/* ----------------------------------------------------------------- */}
      <section id="temoignages" className="py-16 md:py-24">
        {/* Image d'ambiance — lobby d'hôtel de luxe */}
        <div className="relative mb-12 h-[240px] w-full overflow-hidden md:h-[320px]">
          <Image
            src="/images/hotel-lobby-2.png"
            alt="Hall d'hôtel de luxe en Côte d'Ivoire"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-slate-900">Ce que nos clients</span>{" "}
              <span className="text-amber-600">disent de nous</span>
            </h2>
            <p className="mt-4 text-slate-500">
              Plus de 500 hôtels nous font confiance à travers la Côte d&apos;Ivoire.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Témoignage 1 */}
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  &ldquo;OGHOTEL a complètement transformé notre gestion. Nous avons réduit nos erreurs de réservation de 90% et augmenté nos revenus de 35% en seulement 6 mois. L&apos;interface est intuitive et l&apos;équipe support est exceptionnelle.&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    KY
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Kouamé Yao</p>
                    <p className="text-xs text-slate-500">Directeur Général · Hôtel Prestige, Abidjan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Témoignage 2 */}
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  &ldquo;Avant OGHOTEL, je passais des heures sur Excel. Maintenant, tout est automatisé. Les rapports financiers, les réservations, les notifications clients... C&apos;est comme avoir un assistant personnel 24h/24.&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    AD
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Aminata Diallo</p>
                    <p className="text-xs text-slate-500">Propriétaire · Résidence Étoile, Yamoussoukro</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Témoignage 3 */}
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  &ldquo;Le fait que l&apos;équipe soit basée en Côte d&apos;Ivoire fait toute la différence. Ils comprennent nos réalités. L&apos;intégration Mobile Money a été un game-changer pour nos clients. Absolument recommandé !&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    IK
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Ibrahim Koné</p>
                    <p className="text-xs text-slate-500">Responsable Opérations · Grand Hôtel du Nord, Korhogo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Témoignage 4 */}
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="space-y-4 p-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  &ldquo;La fonctionnalité multi-propriétés nous permet de gérer nos 3 établissements depuis un seul écran. La tarification dynamique a augmenté notre taux d&apos;occupation de 60% à 85%. Incroyable !&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
                    MB
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Marie-Claire Bamba</p>
                    <p className="text-xs text-slate-500">Gérante · Hôtel Les Palmiers, San-Pédro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* TARIFS                                                             */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="tarifs"
        className="border-y border-slate-200 bg-slate-50 py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-slate-900">Des tarifs</span>{" "}
              <span className="text-amber-600">adaptés à votre taille</span>
            </h2>
            <p className="mt-4 text-slate-500">
              Un paiement annuel simple. Aucun frais caché. Choisissez la formule
              qui correspond à votre activité.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isFeatured = !!plan.highlighted;
              return (
                <Card
                  key={plan.id}
                  className={
                    isFeatured
                      ? "border-amber-600 bg-gradient-to-b from-amber-600/[0.08] to-transparent shadow-xl shadow-amber-600/10"
                      : "border-slate-200 bg-slate-100"
                  }
                >
                  <CardContent className="flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {plan.target}
                        </p>
                      </div>
                      {plan.badge && (
                        <Badge className="bg-amber-600 text-white hover:bg-amber-600">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-600">{plan.summary}</p>

                    <div>
                      <span className="text-3xl font-bold text-slate-900">
                        {plan.priceLabel}
                      </span>
                      <span className="text-slate-500"> / {plan.period}</span>
                    </div>

                    <ul className="flex-1 space-y-2.5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={
                        isFeatured
                          ? "w-full bg-amber-600 text-white hover:bg-amber-700"
                          : "w-full border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100"
                      }
                      variant={isFeatured ? "default" : "outline"}
                    >
                      <Link href="/#contact">Choisir {plan.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ----------------------------------------------------------------- */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <HelpCircle className="h-4 w-4 text-amber-500" />
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-slate-900">Questions</span>{" "}
              <span className="text-amber-600">fréquentes</span>
            </h2>
            <p className="mt-4 text-slate-500">
              Tout ce que vous devez savoir avant de démarrer avec {APP_NAME}.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <Card className="border-slate-200 bg-white">
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="border-slate-200"
                    >
                      <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-amber-600">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-slate-600">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* CONTACT                                                            */}
      {/* ----------------------------------------------------------------- */}
      <section
        id="contact"
        className="border-t border-slate-200 bg-slate-50 py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            {/* Left — CTA + benefits */}
            <div className="space-y-7">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  Démarrez gratuitement
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Prêt à digitaliser votre gestion hôtelière ?
                </h2>
                <p className="max-w-md text-slate-600">
                  Laissez-nous vos coordonnées. Notre équipe vous contacte par
                  WhatsApp sous 24h pour organiser une démo et activer votre
                  espace.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  <a
                    href={buildWhatsAppUrl(
                      WHATSAPP_CONTACT,
                      `Bonjour, je souhaite souscrire à ${APP_NAME}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {WHATSAPP_DISPLAY}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 hover:text-slate-900"
                >
                  <a href={`mailto:${SUPPORT_EMAIL}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Écrire un email
                  </a>
                </Button>
              </div>

              <ul className="grid gap-3 pt-2 sm:grid-cols-2">
                {[
                  { icon: ShieldCheck, text: "Données isolées par établissement" },
                  { icon: Smartphone, text: "Mobile, tablette et ordinateur" },
                  { icon: Wallet, text: "Mobile Money et espèces supportés" },
                  { icon: Receipt, text: "Factures et reçus professionnels inclus" },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Lead form */}
            <Card className="border-slate-200 bg-white">
              <CardContent>
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Demandez votre démo gratuite
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Réponse sous 24h, sans engagement.
                  </p>
                </div>
                <LeadForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
