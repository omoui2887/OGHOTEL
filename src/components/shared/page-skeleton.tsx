import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton complet d'une page standard (header + 4 cartes + table).
 * À utiliser dans les `loading.tsx` des pages de listes.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      {/* Table */}
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

/**
 * Skeleton pour un tableau uniquement (header + 8 lignes).
 * Utile pour les pages qui n'ont pas de cartes KPI en haut.
 */
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-xl" />
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
