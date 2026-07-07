import Link from "next/link";
import {
  Hotel,
  CalendarCheck,
  Receipt,
  Wallet,
  Users,
  ShieldCheck,
  Smartphone,
  BarChart3,
  ArrowRight,
  Check,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PLANS,
  APP_NAME,
  APP_TAGLINE,
  WHATSAPP_CONTACT,
  WHATSAPP_DISPLAY,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Réservations sans conflit",
    desc: "Plus jamais de double réservation. Le calendrier vérifie les disponibilités en temps réel.",
  },
  {
    icon: Hotel,
    title: "Chambres en temps réel",
    desc: "Libres, occupées, en nettoyage ou hors service — l'état de chaque chambre d'un coup d'œil.",
  },
  {
    icon: Wallet,
    title: "Paiements Mobile Money",
    desc: "Orange, MTN, Moov, Wave, espèces. Suivez acomptes, soldes et impayés sans effort.",
  },
  {
    icon: Receipt,
    title: "Reçus & factures pro",
    desc: "Générez des reçus professionnels imprimables en un clic. Fini les reçus manuels.",
  },
  {
    icon: BarChart3,
    title: "Rapports clairs",
    desc: "Taux d'occupation, chiffre d'affaires, dépenses, résultat net. Pilotez votre activité.",
  },
  {
    icon: Users,
    title: "Personnel & rôles",
    desc: "Réceptionniste, comptable, ménage, maintenance. Des accès adaptés à chaque rôle.",
  },
];

const FAQ = [
  {
    q: "OGHOTEL est-il adapté à ma structure ?",
    a: "O GHOTEL convient aux hôtels, résidences meublées, auberges et autres structures d'hébergement en Côte d'Ivoire, des plus petites aux structures moyennes.",
  },
  {
    q: "Quels moyens de paiement sont acceptés ?",
    a: "Pour l'abonnement : Orange Money, MTN Mobile Money, Moov Money, Wave, espèces ou virement. Dans votre établissement, vous pouvez enregistrer tous les paiements reçus de vos clients, quel que soit le moyen.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Chaque établissement est isolé : vos données ne sont jamais visibles par un autre hôtel. L'accès est protégé par mot de passe et les actions sensibles sont tracées.",
  },
  {
    q: "Puis-je utiliser OGHOTEL sur mon téléphone ?",
    a: "Absolument. L'application est entièrement responsive : smartphone, tablette et ordinateur. Aucune installation requise — tout fonctionne dans le navigateur.",
  },
  {
    q: "Comment démarrer ?",
    a: "Remplissez le formulaire de demande ci-dessous. Notre équipe vous contacte par WhatsApp, vous réglez l'abonnement annuel, et vous recevez un code d'activation pour créer votre espace.",
  },
  {
    q: "Que se passe-t-il à l'expiration de l'abonnement ?",
    a: "Vous recevez des rappels avant l'expiration. Vous pouvez renouveler à tout moment via notre équipe commerciale. Vos données restent accessibles.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Conçu pour la Côte d'Ivoire
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                {APP_TAGLINE}
              </h1>
              <p className="text-lg text-muted-foreground">
                {APP_NAME} centralise vos chambres, réservations, paiements
                Mobile Money, factures et rapports — en français, en FCFA,
                pensé pour les réalités du terrain.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="#contact">
                    Demander une démo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href={buildWhatsAppUrl(
                      WHATSAPP_CONTACT,
                      `Bonjour, je souhaite des informations sur ${APP_NAME}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp : {WHATSAPP_DISPLAY}
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  Sans engagement mensuel
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  À partir de 30 000 FCFA/an
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  Activation en 24h
                </span>
              </div>
            </div>

            {/* Carte visuelle */}
            <div className="relative">
              <Card className="overflow-hidden border-primary/20 shadow-xl">
                <CardHeader className="bg-primary text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Aperçu tableau de bord
                    </CardTitle>
                    <Badge className="bg-accent text-accent-foreground">
                      En direct
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Libres", value: "8", color: "text-emerald-600" },
                      { label: "Occupées", value: "12", color: "text-primary" },
                      { label: "Nettoyage", value: "3", color: "text-amber-600" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center"
                      >
                        <div className={`text-2xl font-bold ${s.color}`}>
                          {s.value}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { room: "Chambre 101", guest: "M. Kouassi", status: "Occupée" },
                      { room: "Chambre 205", guest: "Mme Diallo", status: "Réservée" },
                      { room: "Suite 301", guest: "—", status: "Libre" },
                    ].map((r) => (
                      <div
                        key={r.room}
                        className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="font-medium">{r.room}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.guest}
                          </div>
                        </div>
                        <Badge variant="outline">{r.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Tout ce qu'il faut pour gérer votre établissement
            </h2>
            <p className="mt-4 text-muted-foreground">
              Une interface simple, pensée pour les équipes peu technophiles.
              Professionnalisez votre gestion sans complexité.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4 text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="border-y border-border/60 bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Des tarifs adaptés à votre taille
            </h2>
            <p className="mt-4 text-muted-foreground">
              Un paiement annuel simple. Aucun frais caché. Choisissez la formule
              qui correspond à votre activité.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const isFeatured = plan.id === "privilege";
              return (
                <Card
                  key={plan.id}
                  className={
                    isFeatured
                      ? "border-primary shadow-lg ring-1 ring-primary/20"
                      : ""
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      {isFeatured && (
                        <Badge className="bg-accent text-accent-foreground">
                          Le plus choisi
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.target}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">{plan.priceLabel}</span>
                      <span className="text-muted-foreground"> / {plan.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full"
                      variant={isFeatured ? "default" : "outline"}
                    >
                      <Link href="#contact">Choisir {plan.name}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Questions fréquentes
            </h2>
            <Accordion type="single" collapsible className="mt-10">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CONTACT / CTA */}
      <section id="contact" className="border-t border-border/60 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Prêt à digitaliser votre gestion ?
              </h2>
              <p className="text-primary-foreground/80">
                Laissez-nous vos coordonnées. Notre équipe vous contacte par
                WhatsApp sous 24h pour organiser une démo et activer votre espace.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
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
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <a href={`mailto:${SUPPORT_EMAIL}`}>Écrire un email</a>
                </Button>
              </div>
            </div>

            <Card className="border-0 bg-primary-foreground/5 text-primary-foreground backdrop-blur">
              <CardHeader>
                <CardTitle>Pourquoi choisir {APP_NAME} ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: ShieldCheck, text: "Données isolées par établissement" },
                  { icon: Smartphone, text: "Utilisable sur mobile, tablette, ordinateur" },
                  { icon: Wallet, text: "Mobile Money et espèces pris en charge" },
                  { icon: Receipt, text: "Factures et reçus professionnels inclus" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-accent" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
