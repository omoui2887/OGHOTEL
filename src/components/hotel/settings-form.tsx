"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Building2, CreditCard, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import type { EstablishmentSettings } from "@/lib/hotel/settings-server";
import { formatFCFA, formatDate, buildWhatsAppUrl } from "@/lib/utils";
import { WHATSAPP_CONTACT, APP_NAME } from "@/lib/constants";

type Props = {
  settings: EstablishmentSettings;
  canEdit: boolean;
};

const ESTABLISHMENT_TYPES = [
  { value: "hotel", label: "Hôtel" },
  { value: "residence", label: "Résidence meublée" },
  { value: "auberge", label: "Auberge" },
  { value: "other", label: "Autre" },
];

export function SettingsForm({ settings, canEdit }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const [name, setName] = React.useState(settings.name);
  const [ownerName, setOwnerName] = React.useState(settings.owner_name ?? "");
  const [email, setEmail] = React.useState(settings.email ?? "");
  const [phone, setPhone] = React.useState(settings.phone ?? "");
  const [city, setCity] = React.useState(settings.city ?? "");
  const [address, setAddress] = React.useState(settings.address ?? "");
  const [logoUrl, setLogoUrl] = React.useState(settings.logo_url ?? "");
  const [timezone, setTimezone] = React.useState(settings.timezone);
  const [typeSelect, setTypeSelect] = React.useState(settings.type);

  const hasChanges =
    name !== settings.name ||
    typeSelect !== settings.type ||
    ownerName !== (settings.owner_name ?? "") ||
    email !== (settings.email ?? "") ||
    phone !== (settings.phone ?? "") ||
    city !== (settings.city ?? "") ||
    address !== (settings.address ?? "") ||
    logoUrl !== (settings.logo_url ?? "") ||
    timezone !== settings.timezone;

  async function handleSave() {
    if (!hasChanges) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, type: typeSelect, owner_name: ownerName,
          email, phone, city, address, logo_url: logoUrl, timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success("Paramètres enregistrés");
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  // Calcul progression abonnement
  const totalDays = 365;
  const usedDays = settings.days_until_expiry !== null
    ? Math.max(0, totalDays - settings.days_until_expiry)
    : 0;
  const progressPercent = Math.min(100, (usedDays / totalDays) * 100);

  const isExpiringSoon = settings.days_until_expiry !== null && settings.days_until_expiry <= 30;
  const isExpired = settings.days_until_expiry !== null && settings.days_until_expiry <= 0;

  const whatsappMessage = `Bonjour, je suis client OGHOTEL (${settings.name}) et je souhaite renouveler mon abonnement ${settings.plan_name}. Mon abonnement expire le ${formatDate(settings.subscription_end)}.`;

  return (
    <div className="space-y-6">
      {/* Informations établissement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Informations de l'établissement</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Ces informations apparaissent sur vos factures et reçus.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full rounded-lg object-contain" />
              ) : (
                <span className="text-2xl font-bold">{name?.charAt(0) ?? "O"}</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo_url">URL du logo (optionnel)</Label>
              <Input
                id="logo_url"
                placeholder="https://exemple.ci/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={!canEdit || isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Collez l'URL de votre logo. Format recommandé : carré, 200x200px.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Nom de l'établissement *</Label>
              <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
            <div className="space-y-2">
              <Label>Type d'établissement</Label>
              <Select value={typeSelect} onValueChange={setTypeSelect} disabled={!canEdit || isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTABLISHMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-owner">Nom du gérant</Label>
              <Input id="s-owner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-phone">Téléphone</Label>
              <Input id="s-phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-city">Ville</Label>
              <Input id="s-city" value={city} onChange={(e) => setCity(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="s-address">Adresse</Label>
            <Input id="s-address" value={address} onChange={(e) => setAddress(e.target.value)}
              disabled={!canEdit || isLoading} />
          </div>
        </CardContent>
      </Card>

      {/* Paramètres séjour */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Paramètres du séjour</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Heure standard check-in</Label>
              <Input value={settings.check_in_time} disabled />
              <p className="text-xs text-muted-foreground">14:00 par défaut</p>
            </div>
            <div className="space-y-2">
              <Label>Heure standard check-out</Label>
              <Input value={settings.check_out_time} disabled />
              <p className="text-xs text-muted-foreground">12:00 par défaut</p>
            </div>
            <div className="space-y-2">
              <Label>Fuseau horaire</Label>
              <Input value={timezone} onChange={(e) => setTimezone(e.target.value)}
                disabled={!canEdit || isLoading} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Devise</Label>
              <Input value="FCFA (XOF)" disabled />
              <p className="text-xs text-muted-foreground">La devise est fixée en FCFA pour la Côte d'Ivoire</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-text">Texte personnalisé sur reçu/facture (optionnel)</Label>
            <Textarea
              id="invoice-text"
              rows={2}
              placeholder="Ex : Merci de votre visite. N° RCCM : CI-ABJ-2024-B-12345"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Ce texte apparaîtra en bas de vos factures et reçus. (Bientôt disponible)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bouton sauvegarder */}
      {canEdit && (
        <div className="sticky bottom-0 flex justify-end gap-2 bg-background/80 p-4 backdrop-blur border-t border-border">
          <Button onClick={handleSave} disabled={!hasChanges || isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      )}

      {/* Abonnement OGHOTEL */}
      <Card className={isExpiringSoon ? "border-amber-500/40" : ""}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Abonnement OGHOTEL</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Votre formule actuelle et sa date d'expiration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">
                  Formule {settings.plan_name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.plan_price ? `${formatFCFA(settings.plan_price)}/an` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge
                variant={
                  isExpired ? "destructive"
                  : isExpiringSoon ? "secondary"
                  : "success"
                }
              >
                {isExpired ? "Expiré"
                  : settings.days_until_expiry !== null && settings.days_until_expiry > 0
                  ? `${settings.days_until_expiry} jours restants`
                  : "Actif"}
              </Badge>
              {settings.subscription_end && (
                <p className="text-xs text-muted-foreground">
                  Expire le {formatDate(settings.subscription_end)}
                </p>
              )}
            </div>
          </div>

          {/* Barre de progression */}
          {settings.subscription_start && settings.subscription_end && (
            <div>
              <Progress value={progressPercent} className="h-1.5" />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Début : {formatDate(settings.subscription_start)}</span>
                <span>Fin : {formatDate(settings.subscription_end)}</span>
              </div>
            </div>
          )}

          {/* Alerte expiration */}
          {isExpiringSoon && !isExpired && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-700 text-amber-700">
                Votre abonnement expire bientôt
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Il reste {settings.days_until_expiry} jour(s) avant l'expiration.
                Renouvelez dès maintenant pour éviter toute interruption de service.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <p className="font-medium text-destructive">
                Votre abonnement est expiré
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Contactez l'équipe {APP_NAME} immédiatement pour renouveler.
              </p>
            </div>
          )}

          {/* Bouton WhatsApp */}
          <Button asChild className="w-full" variant="default">
            <a
              href={buildWhatsAppUrl(WHATSAPP_CONTACT, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contacter OGHOTEL pour renouveler
            </a>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            WhatsApp : +225 05 76 10 32 77
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
