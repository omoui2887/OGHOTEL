import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, Mail } from "lucide-react";
import { APP_NAME, WHATSAPP_CONTACT, WHATSAPP_DISPLAY, SUPPORT_EMAIL } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configuration du compte Super Admin et de la plateforme {APP_NAME}.
        </p>
      </div>

      {/* Profil Super Admin */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Profil Super Admin</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nom</span>
            <span className="font-medium">{profile.full_name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rôle</span>
            <Badge>Super Admin</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Statut</span>
            <Badge variant={profile.is_active ? "success" : "destructive"}>
              {profile.is_active ? "Actif" : "Désactivé"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact commercial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact commercial</CardTitle>
          <CardDescription className="text-xs">
            Coordonnées affichées sur la landing page et dans l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-muted-foreground">{WHATSAPP_DISPLAY}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={buildWhatsAppUrl(WHATSAPP_CONTACT, `Bonjour, je suis le Super Admin de ${APP_NAME}.`)}
                target="_blank" rel="noopener noreferrer">
                Ouvrir
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Mail className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${SUPPORT_EMAIL}`}>Écrire</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-base">Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Changez régulièrement le mot de passe Super Admin</p>
          <p>• Régénérez les clés Supabase si elles ont été exposées</p>
          <p>• Vérifiez que les politiques RLS sont activées (migration 003)</p>
          <p>• Ne partagez jamais les clés API ou mots de passe</p>
        </CardContent>
      </Card>
    </div>
  );
}
