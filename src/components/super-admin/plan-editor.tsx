"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription,
} from "@/components/ui/card";
import {
 FEATURE_DEFINITIONS,
 FEATURE_CATEGORIES,
 PLAN_NAME_LABELS,
 type Plan,
 type PlanFeatures,
} from "@/lib/super-admin/plans";
import { formatFCFA } from "@/lib/utils";

type PlanEditorProps = {
 plan: Plan;
};

export function PlanEditor({ plan }: PlanEditorProps) {
 const router = useRouter();

 const [priceFcfa, setPriceFcfa] = React.useState(plan.price_fcfa);
 const [description, setDescription] = React.useState(plan.description ?? "");
 const [isActive, setIsActive] = React.useState(plan.is_active);
 const [maxUsers, setMaxUsers] = React.useState<string>(
  plan.max_users === null ? "" : String(plan.max_users)
 );
 const [maxEstablishments, setMaxEstablishments] = React.useState<string>(
  plan.max_establishments === null ? "" : String(plan.max_establishments)
 );
 const [features, setFeatures] = React.useState<PlanFeatures>(plan.features);
 const [isSaving, setIsSaving] = React.useState(false);

 // Vérifier s'il y a des changements
 const hasChanges =
  priceFcfa !== plan.price_fcfa ||
  description !== (plan.description ?? "") ||
  isActive !== plan.is_active ||
  maxUsers !== (plan.max_users === null ? "" : String(plan.max_users)) ||
  maxEstablishments !==
   (plan.max_establishments === null ? "" : String(plan.max_establishments)) ||
  JSON.stringify(features) !== JSON.stringify(plan.features);

 // Avertissement si plan utilisé et qu'on veut le désactiver
 const willDeactivate = !isActive && plan.is_active && (plan.establishments_count ?? 0) > 0;

 function toggleFeature(key: keyof PlanFeatures, checked: boolean) {
  setFeatures((prev) => ({
   ...prev,
   [key]: checked,
  }));
 }

 async function handleSave() {
  if (!hasChanges) return;
  setIsSaving(true);
  try {
   const body: Record<string, unknown> = {
    price_fcfa: priceFcfa,
    description: description || null,
    is_active: isActive,
    max_users: maxUsers === "" ? null : parseInt(maxUsers, 10),
    max_establishments:
     maxEstablishments === "" ? null : parseInt(maxEstablishments, 10),
    features,
   };

   const res = await fetch(`/api/super-admin/plans/${plan.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
   });

   const data = await res.json();

   if (!res.ok) {
    toast.error(data.error ?? "Erreur lors de la mise à jour");
    return;
   }

   toast.success(`Plan ${PLAN_NAME_LABELS[plan.name] ?? plan.name} mis à jour`);
   router.refresh();
  } catch {
   toast.error("Erreur réseau");
  } finally {
   setIsSaving(false);
  }
 }

 return (
  <div className="space-y-6">
   {/* En-tête plan */}
   <Card>
    <CardHeader>
     <div className="flex items-center justify-between gap-4">
      <div>
       <CardTitle className="text-xl">
        {PLAN_NAME_LABELS[plan.name] ?? plan.name}
       </CardTitle>
       <CardDescription className="text-xs">
        {plan.establishments_count !== undefined && (
         <>
          {plan.establishments_count} établissement
          {plan.establishments_count > 1 ? "s" : ""} utilise
          {plan.establishments_count > 1 ? "nt" : ""} ce plan
         </>
        )}
       </CardDescription>
      </div>
      <div className="flex items-center gap-2">
       <Label htmlFor={`active-${plan.id}`} className="text-xs text-muted-foreground">
        {isActive ? "Actif" : "Inactif"}
       </Label>
       <Switch
        id={`active-${plan.id}`}
        checked={isActive}
        onCheckedChange={setIsActive}
       />
      </div>
     </div>
    </CardHeader>
    <CardContent className="space-y-4">
     {/* Prix */}
     <div className="space-y-2">
      <Label htmlFor={`price-${plan.id}`}>
       Prix annuel (FCFA) <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
       <Input
        id={`price-${plan.id}`}
        type="number"
        min={0}
        step={1000}
        value={priceFcfa}
        onChange={(e) => setPriceFcfa(parseInt(e.target.value || "0", 10))}
        className="pr-16"
       />
       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        FCFA/an
       </span>
      </div>
      <p className="text-xs text-muted-foreground">
       Aperçu : {formatFCFA(priceFcfa)} / an
      </p>
     </div>

     {/* Limites */}
     <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
       <Label htmlFor={`max-users-${plan.id}`}>
        Utilisateurs max
       </Label>
       <Input
        id={`max-users-${plan.id}`}
        type="number"
        min={1}
        placeholder="Vide = illimité"
        value={maxUsers}
        onChange={(e) => setMaxUsers(e.target.value)}
       />
       <p className="text-xs text-muted-foreground">
        Laisser vide pour illimité
       </p>
      </div>
      <div className="space-y-2">
       <Label htmlFor={`max-est-${plan.id}`}>
        Établissements max
       </Label>
       <Input
        id={`max-est-${plan.id}`}
        type="number"
        min={1}
        placeholder="Vide = illimité"
        value={maxEstablishments}
        onChange={(e) => setMaxEstablishments(e.target.value)}
       />
       <p className="text-xs text-muted-foreground">
        Laisser vide pour illimité
       </p>
      </div>
     </div>

     {/* Description */}
     <div className="space-y-2">
      <Label htmlFor={`desc-${plan.id}`}>Description publique</Label>
      <Textarea
       id={`desc-${plan.id}`}
       rows={3}
       placeholder="Description affichée sur la landing page et dans l'app"
       value={description}
       onChange={(e) => setDescription(e.target.value)}
      />
     </div>

     {/* Avertissement désactivation */}
     {willDeactivate && (
      <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 ">
       <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
       <div>
        <p className="font-medium">Attention — plan utilisé</p>
        <p className="text-xs mt-0.5">
         {plan.establishments_count} établissement(s) utilise(nt) ce plan.
         Le désactiver empêchera les nouveaux clients de le choisir, mais
         les clients existants le garderont jusqu'à expiration.
        </p>
       </div>
      </div>
     )}
    </CardContent>
   </Card>

   {/* Fonctionnalités */}
   <Card>
    <CardHeader>
     <CardTitle className="text-base">Fonctionnalités incluses</CardTitle>
     <CardDescription className="text-xs">
      Cochez les modules accessibles avec ce plan
     </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
     {FEATURE_CATEGORIES.map((cat) => {
      const catFeatures = FEATURE_DEFINITIONS.filter(
       (f) => f.category === cat.value
      );
      if (catFeatures.length === 0) return null;
      return (
       <div key={cat.value} className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
         {cat.label}
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
         {catFeatures.map((feat) => {
          const isChecked = features[feat.key] === true;
          return (
           <div
            key={feat.key}
            className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
           >
            <Checkbox
             id={`${plan.id}-${feat.key}`}
             checked={isChecked}
             onCheckedChange={(v) =>
              toggleFeature(feat.key, v === true)
             }
             className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
             <Label
              htmlFor={`${plan.id}-${feat.key}`}
              className="text-sm font-medium cursor-pointer"
             >
              {feat.label}
             </Label>
             <p className="text-xs text-muted-foreground mt-0.5">
              {feat.description}
             </p>
            </div>
           </div>
          );
         })}
        </div>
       </div>
      );
     })}
    </CardContent>
   </Card>

   {/* Bouton sauvegarder */}
   <div className="sticky bottom-0 flex justify-end gap-2 bg-background/80 p-4 backdrop-blur border-t border-border">
    <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="lg">
     {isSaving ? (
      <>
       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
       Enregistrement…
      </>
     ) : (
      <>
       <Save className="mr-2 h-4 w-4" />
       Enregistrer les modifications
      </>
     )}
    </Button>
   </div>
  </div>
 );
}
