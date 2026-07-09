import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin, Calendar, CreditCard } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // Fetch défensif : si Supabase n'est pas configuré ou qu'une erreur
  // réseau/DB survient, on affiche la page avec une liste vide au lieu de
  // planter toute la page via l'error boundary global.
  let establishments: {
    id: string;
    name: string;
    type: string | null;
    owner_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
    subscription_status: string | null;
    subscription_start: string | null;
    subscription_end: string | null;
    plan: { name: string; price_fcfa: number } | null;
  }[] = [];

  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("establishments")
      .select(`
        id, name, type, owner_name, email, phone, city, address,
        subscription_status, subscription_start, subscription_end,
        plan:plans(name, price_fcfa)
      `)
      .order("created_at", { ascending: false });
    establishments = (data ?? []) as unknown as typeof establishments;
  } catch (err) {
    console.error("Erreur chargement clients:", err);
  }

  const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
    active: { label: "Actif", variant: "success" },
    expiring: { label: "Expire bientôt", variant: "warning" },
    expired: { label: "Expiré", variant: "destructive" },
    suspended: { label: "Suspendu", variant: "secondary" },
    trial: { label: "Essai", variant: "outline" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tous les établissements abonnés à OGHOTEL.
        </p>
      </div>

      {establishments && establishments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {establishments.map((est: any) => {
            const statusInfo = STATUS_LABELS[est.subscription_status] ?? { label: est.subscription_status, variant: "outline" as const };
            return (
              <Card key={est.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{est.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {est.type === "hotel" ? "Hôtel" : est.type === "residence" ? "Résidence" : est.type === "auberge" ? "Auberge" : "Autre"}
                          {est.owner_name ? ` · ${est.owner_name}` : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {est.plan && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{est.plan.name} — {formatFCFA(est.plan.price_fcfa)}/an</span>
                    </div>
                  )}
                  {est.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{est.phone}</span>
                    </div>
                  )}
                  {est.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{est.email}</span>
                    </div>
                  )}
                  {est.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{est.city}</span>
                    </div>
                  )}
                  {est.subscription_end && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Expire le {formatDate(est.subscription_end)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Aucun client pour le moment</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Les établissements activés apparaîtront ici
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
