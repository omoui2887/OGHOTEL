import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  BedDouble,
  Calendar,
  Clock,
  History,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getLeadById,
  getLeadActivity,
} from "@/lib/super-admin/leads-server";
import {
  getBusinessTypeLabel,
  LEAD_STATUS_LABELS,
} from "@/lib/super-admin/leads";
import { LeadDetailEditor } from "@/components/super-admin/lead-detail-editor";
import { buildWhatsAppUrl, formatDate, formatDateTime } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Détail prospect",
};

type Params = Promise<{ id: string }>;

export default async function LeadDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [lead, activity] = await Promise.all([
    getLeadById(id),
    getLeadActivity(id),
  ]);

  if (!lead) {
    notFound();
  }

  const statusInfo = LEAD_STATUS_LABELS[lead.status] ?? {
    label: lead.status,
    variant: "outline" as const,
  };

  const whatsappMessage = `Bonjour ${lead.full_name}, je vous contacte concernant votre demande pour ${APP_NAME}.`;

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/super-admin/leads" aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {lead.full_name}
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Demande du {formatDateTime(lead.created_at)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche : infos prospect + message */}
        <div className="space-y-6 lg:col-span-2">
          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Structure</p>
                    <p className="text-sm font-medium">{lead.business_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getBusinessTypeLabel(lead.business_type)}
                    </p>
                  </div>
                </div>

                {lead.city && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ville</p>
                      <p className="text-sm font-medium">{lead.city}</p>
                    </div>
                  </div>
                )}

                {lead.rooms_count !== null && (
                  <div className="flex items-start gap-3">
                    <BedDouble className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Chambres</p>
                      <p className="text-sm font-medium">{lead.rooms_count}</p>
                    </div>
                  </div>
                )}

                {lead.desired_plan_name && (
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Formule souhaitée</p>
                      <Badge variant="outline" className="mt-0.5">
                        {lead.desired_plan_name}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="text-sm font-medium">{lead.phone}</p>
                  </div>
                </div>

                {lead.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium break-all">{lead.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions WhatsApp + appel */}
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="default">
                  <a
                    href={buildWhatsAppUrl(lead.phone, whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contacter par WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${lead.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Appeler
                  </a>
                </Button>
                {lead.email && (
                  <Button asChild variant="outline">
                    <a href={`mailto:${lead.email}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message du prospect */}
          {lead.message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message du prospect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-foreground/90">
                  {lead.message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Historique d'activité */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Historique</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Dernières actions sur ce prospect
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucune activité enregistrée pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {activity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {log.action === "lead_status_changed" && "Statut modifié"}
                          {log.action === "lead_notes_updated" && "Notes mises à jour"}
                          {!["lead_status_changed", "lead_notes_updated"].includes(log.action) && log.action}
                        </p>
                        {log.action === "lead_status_changed" && (
                          <p className="text-xs text-muted-foreground">
                            {LEAD_STATUS_LABELS[(log.metadata as any).old_status]?.label ?? (log.metadata as any).old_status}
                            {" → "}
                            {LEAD_STATUS_LABELS[(log.metadata as any).new_status]?.label ?? (log.metadata as any).new_status}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {log.user_email ?? "Système"} · {formatDateTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : édition statut + notes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestion du prospect</CardTitle>
              <CardDescription className="text-xs">
                Modifiez le statut et ajoutez des notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadDetailEditor lead={lead} />
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créé le</span>
                <span>{formatDateTime(lead.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mis à jour</span>
                <span>{formatDateTime(lead.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-[10px]">{lead.id.slice(0, 8)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
