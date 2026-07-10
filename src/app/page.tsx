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
      <section className="relative overflow-hidden border-b border-white/10">
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
                <span className="text-white">{HERO_TITLE_WHITE}</span>
                <br />
                <span className="text-amber-600">{HERO_TITLE_ORANGE}</span>
              </h1>

              <p className="max-w-xl text-lg text-slate-300">
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
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
                      className="flex items-center gap-2 text-sm text-slate-300"
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
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <Icon className="mb-2 h-5 w-5 text-amber-500" />
                      <div className="text-2xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — hotel lobby image */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
                  alt="Lobby d'hôtel moderne et lumineux"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-amber-600/30 bg-[#0c1e3a]/90 p-4 shadow-lg backdrop-blur sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      +45% de revenus
                    </div>
                    <div className="text-xs text-slate-400">
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Fonctionnalités Puissantes
            </h2>
            <p className="mt-4 text-slate-400">
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
                  className="border-white/10 bg-white/5 transition-colors hover:border-amber-600/40 hover:bg-white/[0.07]"
                >
                  <CardContent className="space-y-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
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
        className="border-y border-white/10 bg-white/[0.02] py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-medium text-amber-400">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Produit
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Tout ce dont vous avez besoin
            </h2>
            <p className="mt-4 text-slate-400">
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
                  className="border-white/10 bg-[#0c1e3a]/60 transition-colors hover:border-amber-600/40"
                >
                  <CardContent className="space-y-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
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
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-white">{RESULTS_SECTION.titleWhite}</span>{" "}
              <span className="text-amber-600">{RESULTS_SECTION.titleOrange}</span>
            </h2>
            <p className="mt-4 text-slate-400">{RESULTS_SECTION.subtitle}</p>
          </div>

          <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80"
                alt="Réception d'hôtel avec réceptionniste au travail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Card */}
            <Card className="border-amber-600/30 bg-gradient-to-br from-amber-600/10 to-transparent">
              <CardContent className="space-y-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600/15 text-amber-500">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {RESULTS_SECTION.cardTitle}
                </h3>
                <p className="text-slate-300">{RESULTS_SECTION.cardDesc}</p>
                <Button
                  asChild
                  variant="link"
                  className="h-auto p-0 text-amber-500 hover:text-amber-400"
                >
                  <Link href="/#contact">
                    {RESULTS_SECTION.cardCta}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
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
        className="border-y border-white/10 bg-white/[0.02] py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="text-white">Des tarifs</span>{" "}
              <span className="text-amber-600">adaptés à votre taille</span>
            </h2>
            <p className="mt-4 text-slate-400">
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
                      : "border-white/10 bg-white/5"
                  }
                >
                  <CardContent className="flex h-full flex-col gap-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {plan.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {plan.target}
                        </p>
                      </div>
                      {plan.badge && (
                        <Badge className="bg-amber-600 text-white hover:bg-amber-600">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-300">{plan.summary}</p>

                    <div>
                      <span className="text-3xl font-bold text-white">
                        {plan.priceLabel}
                      </span>
                      <span className="text-slate-400"> / {plan.period}</span>
                    </div>

                    <ul className="flex-1 space-y-2.5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm text-slate-300"
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
                          : "w-full border-white/20 bg-transparent text-white hover:bg-white/10"
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
              <span className="text-white">Questions</span>{" "}
              <span className="text-amber-600">fréquentes</span>
            </h2>
            <p className="mt-4 text-slate-400">
              Tout ce que vous devez savoir avant de démarrer avec {APP_NAME}.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <Card className="border-white/10 bg-white/5">
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`item-${i}`}
                      className="border-white/10"
                    >
                      <AccordionTrigger className="text-left text-base font-medium text-white hover:text-amber-400">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-slate-300">
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
        className="border-t border-white/10 bg-[#0a1929] py-16 md:py-24"
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
                <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Prêt à digitaliser votre gestion hôtelière ?
                </h2>
                <p className="max-w-md text-slate-300">
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
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200"
                  >
                    <item.icon className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Lead form */}
            <Card className="border-white/10 bg-[#0c1e3a]">
              <CardContent>
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-white">
                    Demandez votre démo gratuite
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
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
