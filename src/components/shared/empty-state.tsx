import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

/**
 * Composant d'état vide réutilisable.
 * Affiche un message clair avec un bouton d'action optionnel.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Button asChild className="mt-6">
            <Link href={actionHref}>
              <Plus className="mr-2 h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button onClick={onAction} className="mt-6">
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
