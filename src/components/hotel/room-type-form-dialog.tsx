"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { COMMON_ROOM_TYPE_NAMES } from "@/lib/hotel/room-types";
import type { RoomType } from "@/lib/hotel/room-types";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
  default_price: z.coerce
    .number({ error: "Prix invalide" })
    .int("Le prix doit être un entier")
    .min(0, "Le prix ne peut pas être négatif")
    .max(10000000, "Prix trop élevé"),
  capacity: z.coerce
    .number({ error: "Capacité invalide" })
    .int()
    .min(1, "Au moins 1 personne")
    .max(50, "Capacité trop élevée"),
  description: z.string().max(1000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomType?: RoomType | null;
};

export function RoomTypeFormDialog({ open, onOpenChange, roomType }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const isEdit = !!roomType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: roomType?.name ?? "",
      default_price: roomType?.default_price ?? 15000,
      capacity: roomType?.capacity ?? 2,
      description: roomType?.description ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: roomType?.name ?? "",
        default_price: roomType?.default_price ?? 15000,
        capacity: roomType?.capacity ?? 2,
        description: roomType?.description ?? "",
      });
    }
  }, [open, roomType, reset]);

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const url = roomType
        ? `/api/hotel/room-types/${roomType.id}`
        : "/api/hotel/room-types";
      const method = roomType ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(roomType ? "Type modifié" : "Type de chambre créé");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le type" : "Nouveau type de chambre"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez les informations de ce type de chambre."
              : "Créez un type de chambre (ex : Simple, Double, Suite...)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              list="room-type-suggestions"
              placeholder="Ex : Suite VIP"
              {...register("name")}
            />
            <datalist id="room-type-suggestions">
              {COMMON_ROOM_TYPE_NAMES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_price">
                Prix par défaut (FCFA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="default_price"
                type="number"
                min={0}
                step={1000}
                {...register("default_price")}
              />
              {errors.default_price && (
                <p className="text-xs text-destructive">{errors.default_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacité <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Description du type de chambre..."
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
