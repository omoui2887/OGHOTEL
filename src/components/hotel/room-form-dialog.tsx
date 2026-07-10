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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMON_AMENITIES } from "@/lib/hotel/rooms";
import type { Room } from "@/lib/hotel/rooms";
import type { RoomType } from "@/lib/hotel/room-types";

const schema = z.object({
  room_type_id: z.string().uuid("Type de chambre requis"),
  room_number: z.string().min(1, "Le numéro est requis").max(50),
  floor: z.string().max(50).optional().or(z.literal("")),
  capacity: z
    .number({ error: "Capacité invalide" })
    .int()
    .min(1, "Au moins 1")
    .max(50),
  price_per_night: z
    .number({ error: "Prix invalide" })
    .int()
    .min(0, "Prix négatif impossible")
    .max(10000000),
  half_day_price: z
    .number()
    .int()
    .min(0)
    .max(10000000)
    .optional()
    .or(z.literal("")),
  amenities: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  roomTypes: RoomType[];
};

export function RoomFormDialog({ open, onOpenChange, room, roomTypes }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [roomTypeId, setRoomTypeId] = React.useState("");
  const [amenities, setAmenities] = React.useState<string[]>([]);
  const isEdit = !!room;

  const activeRoomTypes = roomTypes.filter((rt) => rt.is_active);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      room_type_id: "",
      room_number: "",
      floor: "",
      capacity: 2,
      price_per_night: 15000,
      half_day_price: "",
      amenities: [],
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      const typeId = room?.room_type_id ?? "";
      setRoomTypeId(typeId);
      setAmenities(room?.amenities ?? []);
      reset({
        room_type_id: typeId,
        room_number: room?.room_number ?? "",
        floor: room?.floor ?? "",
        capacity: room?.capacity ?? 2,
        price_per_night: room?.price_per_night ?? 15000,
        half_day_price: room?.half_day_price ?? "",
        amenities: room?.amenities ?? [],
        notes: room?.notes ?? "",
      });
    }
  }, [open, room, reset]);

  // Auto-remplir prix et capacité depuis le type sélectionné (création seulement)
  React.useEffect(() => {
    if (!isEdit && roomTypeId) {
      const rt = roomTypes.find((r) => r.id === roomTypeId);
      if (rt) {
        setValue("price_per_night", rt.default_price);
        setValue("capacity", rt.capacity);
      }
    }
  }, [roomTypeId, roomTypes, isEdit, setValue]);

  function toggleAmenity(amenity: string, checked: boolean) {
    const next = checked
      ? [...amenities, amenity]
      : amenities.filter((a) => a !== amenity);
    setAmenities(next);
    setValue("amenities", next);
  }

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const body = {
        ...values,
        half_day_price:
          typeof values.half_day_price === "number"
            ? values.half_day_price
            : undefined,
      };

      const url = room ? `/api/hotel/rooms/${room.id}` : "/api/hotel/rooms";
      const method = room ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(room ? "Chambre modifiée" : "Chambre créée");
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la chambre" : "Nouvelle chambre"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Chambre ${room?.room_number}`
              : "Créez une nouvelle chambre dans votre établissement."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type de chambre */}
          <div className="space-y-2">
            <Label>
              Type de chambre <span className="text-destructive">*</span>
            </Label>
            <Select
              value={roomTypeId}
              onValueChange={(v) => {
                setRoomTypeId(v);
                setValue("room_type_id", v, { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type..." />
              </SelectTrigger>
              <SelectContent>
                {activeRoomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name} — {new Intl.NumberFormat("fr-FR").format(rt.default_price)} FCFA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room_type_id && (
              <p className="text-xs text-destructive">{errors.room_type_id.message}</p>
            )}
            {activeRoomTypes.length === 0 && (
              <p className="text-xs text-amber-700">
                Créez d'abord un type de chambre dans /app/room-types
              </p>
            )}
          </div>

          {/* Numéro + Étage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">
                Numéro / Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="room_number"
                placeholder="Ex : 101"
                {...register("room_number")}
              />
              {errors.room_number && (
                <p className="text-xs text-destructive">{errors.room_number.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Étage / Bâtiment</Label>
              <Input
                id="floor"
                placeholder="Ex : 1er étage"
                {...register("floor")}
              />
            </div>
          </div>

          {/* Capacité + Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacité <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                {...register("capacity", { valueAsNumber: true })}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">{errors.capacity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_night">
                Prix par nuit (FCFA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price_per_night"
                type="number"
                min={0}
                step={1000}
                {...register("price_per_night", { valueAsNumber: true })}
              />
              {errors.price_per_night && (
                <p className="text-xs text-destructive">{errors.price_per_night.message}</p>
              )}
            </div>
          </div>

          {/* Prix demi-journée */}
          <div className="space-y-2">
            <Label htmlFor="half_day_price">Prix demi-journée (optionnel)</Label>
            <Input
              id="half_day_price"
              type="number"
              min={0}
              step={1000}
              placeholder="Laisser vide si pas de tarif demi-journée"
              {...register("half_day_price", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return "";
                  const n = typeof v === "number" ? v : Number(v);
                  return Number.isNaN(n) ? "" : n;
                },
              })}
            />
          </div>

          {/* Équipements */}
          <div className="space-y-2">
            <Label>Équipements</Label>
            <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 sm:grid-cols-3">
              {COMMON_AMENITIES.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={amenities.includes(amenity)}
                    onCheckedChange={(v) => toggleAmenity(amenity, v === true)}
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Informations sur cette chambre..."
              {...register("notes")}
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
