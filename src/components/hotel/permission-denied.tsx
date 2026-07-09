import { ShieldX } from "lucide-react";

export function PermissionDenied({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-bold">Permission refusée</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {message ??
          "Vous n'avez pas la permission d'accéder à ce module. Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur."}
      </p>
    </div>
  );
}
