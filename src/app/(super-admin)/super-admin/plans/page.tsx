import { getPlans } from "@/lib/super-admin/plans-server";
import {
  PLAN_NAME_LABELS,
  FEATURE_DEFINITIONS,
} from "@/lib/super-admin/plans";
import { PlanEditor } from "@/components/super-admin/plan-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export const metadata = {
  title: "Formules",
};

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Formules tarifaires
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les prix, limites et fonctionnalités de chaque formule d'abonnement.
          Les modifications s'appliquent aux nouveaux clients uniquement.
        </p>
      </div>

      {/* Aperçu comparatif des 3 plans */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aperçu comparatif</CardTitle>
          <CardDescription className="text-xs">
            Vue d'ensemble des fonctionnalités par formule
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Fonctionnalité
                </th>
                {plans.map((p) => (
                  <th key={p.id} className="px-3 py-2 text-center font-medium">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold">
                        {PLAN_NAME_LABELS[p.name] ?? p.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {formatFCFA(p.price_fcfa)}/an
                      </span>
                      {!p.is_active && (
                        <Badge variant="outline" className="text-xs">
                          Inactif
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_DEFINITIONS.map((feat, idx) => (
                <tr
                  key={feat.key}
                  className={idx % 2 === 0 ? "bg-muted/20" : ""}
                >
                  <td className="px-3 py-2 text-muted-foreground">
                    {feat.label}
                  </td>
                  {plans.map((p) => {
                    const val = p.features[feat.key];
                    const isIncluded = val === true;
                    return (
                      <td key={p.id} className="px-3 py-2 text-center">
                        {isIncluded ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Ligne max users */}
              <tr className="bg-muted/20">
                <td className="px-3 py-2 text-muted-foreground">
                  Utilisateurs max
                </td>
                {plans.map((p) => (
                  <td key={p.id} className="px-3 py-2 text-center font-medium">
                    {p.max_users === null ? "Illimité" : p.max_users}
                  </td>
                ))}
              </tr>
              {/* Ligne max establishments */}
              <tr>
                <td className="px-3 py-2 text-muted-foreground">
                  Établissements max
                </td>
                {plans.map((p) => (
                  <td key={p.id} className="px-3 py-2 text-center font-medium">
                    {p.max_establishments === null ? "Illimité" : p.max_establishments}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Éditeurs de plans */}
      <div className="space-y-8">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <p className="text-sm font-medium">
                Aucun plan trouvé
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Exécutez la migration <code>002_seed_plans.sql</code> pour créer les plans initiaux
              </p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <PlanEditor key={plan.id} plan={plan} />
          ))
        )}
      </div>
    </div>
  );
}
