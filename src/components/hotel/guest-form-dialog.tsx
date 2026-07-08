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
import {
  ID_TYPE_OPTIONS,
  COMMON_NATIONALITIES,
  type Guest,
} from "@/lib/hotel/guests";

const schema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Nom trop long"),
  phone: z
    .string()
    .min(8, "Numéro invalide")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
  email: z
    .string()
    .email("Email invalide")
    .max(150)
    .optional()
    .or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  id_type: z.enum(["cni", "passport", "permit", "other"]).optional(),
  id_number: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
};

export function GuestFormDialog({ open, onOpenChange, guest }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [idType, setIdType] = React.useState<string>("");
  const [nationality, setNationality] = React.useState<string>("");
  const isEdit = !!guest;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      nationality: "",
      id_type: undefined,
      id_number: "",
      address: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      const t = guest?.id_type ?? "";
      const nat = guest?.nationality ?? "";
      setIdType(t);
      setNationality(nat);
      reset({
        full_name: guest?.full_name ?? "",
        phone: guest?.phone ?? "",
        email: guest?.email ?? "",
        nationality: nat,
        id_type: (t as Values["id_type"]) || undefined,
        id_number: guest?.id_number ?? "",
        address: guest?.address ?? "",
        notes: guest?.notes ?? "",
      });
    }
  }, [open, guest, reset]);

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const url = guest ? `/api/hotel/guests/${guest.id}` : "/api/hotel/guests";
      const method = guest ? "PATCH" : "POST";

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

      toast.success(guest ? "Client modifié" : "Client créé");
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
            {isEdit ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modifiez les informations de ${guest?.full_name}`
              : "Créez une fiche client. Elle pourra être réutilisée lors d'une réservation."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom + Téléphone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nom complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                placeholder="Ex : Jean Kouassi"
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Téléphone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+225 07 00 00 00 00"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@exemple.ci"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Nationalité */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationalité (optionnel)</Label>
            <Input
              id="nationality"
              list="nationality-suggestions"
              placeholder="Ex : Ivoirienne"
              value={nationality}
              onChange={(e) => {
                setNationality(e.target.value);
                setValue("nationality", e.target.value);
              }}
            />
            <datalist id="nationality-suggestions">
              {COMMON_NATIONALITIES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          {/* Pièce d'identité */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de pièce</Label>
              <Select
                value={idType}
                onValueChange={(v) => {
                  setIdType(v);
                  setValue("id_type", v as Values["id_type"]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_number">Numéro de pièce</Label>
              <Input
                id="id_number"
                placeholder="Ex : CI123456789"
                {...register("id_number")}
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse (optionnel)</Label>
            <Input
              id="address"
              placeholder="Cocody, Abidjan"
              {...register("address")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Préférences, remarques..."
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
