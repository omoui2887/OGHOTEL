import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * Composant de chargement skeleton réutilisable.
 * Affiche un spinner avec un message optionnel.
 */
export function LoadingState({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Skeleton pour cartes statistiques.
 */
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour tableau.
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
