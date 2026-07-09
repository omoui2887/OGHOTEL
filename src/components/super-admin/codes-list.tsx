"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Send, Ban, Inbox, ChevronLeft, ChevronRight, Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CODE_STATUS_LABELS,
  CODE_STATUS_OPTIONS,
  type ActivationCode,
} from "@/lib/super-admin/activation-codes";
import { formatFCFA, formatDateTime } from "@/lib/utils";

type CodesListProps = {
  codes: ActivationCode[];
  total: number;
  page: number;
  totalPages: number;
  initialStatus: string;
  plans: { id: string; name: string }[];
};

export function CodesList({
  codes,
  total,
  page,
  totalPages,
  initialStatus,
  plans,
}: CodesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = React.useRef(true);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [showTrialDialog, setShowTrialDialog] = React.useState(false);
  const [trialPlan, setTrialPlan] = React.useState("");
  const [trialLoading, setTrialLoading] = React.useState(false);
  const [trialResult, setTrialResult] = React.useState<string | null>(null);

  // Debounce pour le filtre statut — on saute le premier render pour éviter
  // un router.push inutile au montage (qui provoquerait un re-fetch serveur).
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (statusFilter && statusFilter !== "all") {
        sp.set("status", statusFilter);
      } else {
        sp.delete("status");
      }
      sp.delete("page");
      const qs = sp.toString();
      router.push(`/super-admin/activation-codes${qs ? "?" + qs : ""}`);
    }, 400);
    return () => clearTimeout(t);
  }, [statusFilter, router, searchParams]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    router.push(`/super-admin/activation-codes${qs ? "?" + qs : ""}`);
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copié");
    } catch {
      toast.error("Impossible de copier");
    }
  }

  async function handleAction(
    codeId: string,
    action: "sent" | "cancelled"
  ) {
    setActionLoading(`${codeId}-${action}`);
    try {
      const res = await fetch(`/api/super-admin/activation-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Action impossible");
        return;
      }
      toast.success(data.message);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtre */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {CODE_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {total} code{total > 1 ? "s" : ""}
          </span>
          <div className="ml-auto">
            <Button
              size="sm"
              variant="default"
              onClick={() => { setShowTrialDialog(true); setTrialResult(null); setTrialPlan(""); }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Code d'essai 24h
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {codes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Aucun code trouvé
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Les codes sont générés depuis la section "Paiements SaaS"
                après validation d'un paiement.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Destinataire</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Formule</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Expiration</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => {
                    const statusInfo = CODE_STATUS_LABELS[code.status];
                    const isExpired =
                      new Date(code.expires_at) < new Date() && code.status === "generated";
                    return (
                      <tr
                        key={code.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyCode(code.code)}
                            className="group flex items-center gap-2 font-mono font-semibold text-primary"
                            title="Copier le code"
                          >
                            {code.code}
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {code.lead_name ?? code.establishment_name ?? "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {code.plan_name ? (
                            <Badge variant="outline">{code.plan_name}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatFCFA(code.amount_fcfa)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="ml-1 text-xs">
                              Expiré
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDateTime(code.expires_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => copyCode(code.code)}
                              title="Copier"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {(code.status === "generated" || code.status === "sent") && (
                              <>
                                {code.status === "generated" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => handleAction(code.id, "sent")}
                                    disabled={actionLoading === `${code.id}-sent`}
                                  >
                                    <Send className="mr-1 h-3.5 w-3.5" />
                                    Marqué envoyé
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleAction(code.id, "cancelled")}
                                  disabled={actionLoading === `${code.id}-cancelled`}
                                  title="Annuler"
                                >
                                  <Ban className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog code d'essai */}
      <Dialog open={showTrialDialog} onOpenChange={setShowTrialDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Code d'essai 24h</DialogTitle>
            <DialogDescription>
              Générez un code d'activation d'essai valide 24 heures, sans paiement requis.
              Idéal pour faire tester le SaaS à un prospect.
            </DialogDescription>
          </DialogHeader>

          {trialResult ? (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                <p className="text-xs text-muted-foreground mb-2">Code d'essai généré</p>
                <p className="text-2xl font-bold tracking-wider text-primary font-mono">
                  {trialResult}
                </p>
                <p className="mt-2 text-xs text-amber-500">Valide 24h uniquement</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(trialResult);
                    toast.success("Code copié");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copier
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTrialDialog(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Formule à tester</label>
                <Select value={trialPlan} onValueChange={setTrialPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une formule..." />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <p>⚠️ Ce code sera valide <strong>24 heures uniquement</strong>.</p>
                <p>Le prospect pourra créer son établissement et tester toutes les fonctionnalités.</p>
                <p>Après 24h, le code expirera automatiquement.</p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTrialDialog(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={async () => {
                    if (!trialPlan) { toast.error("Veuillez sélectionner une formule"); return; }
                    setTrialLoading(true);
                    try {
                      const res = await fetch("/api/super-admin/activation-codes/trial", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan_id: trialPlan }),
                      });
                      const data = await res.json();
                      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
                      setTrialResult(data.code.code);
                      toast.success(data.message);
                      router.refresh();
                    } catch { toast.error("Erreur réseau"); }
                    finally { setTrialLoading(false); }
                  }}
                  disabled={trialLoading || !trialPlan}
                >
                  {trialLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Générer le code d'essai</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
