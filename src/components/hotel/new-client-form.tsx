"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  UserPlus,
  Upload,
  FileCheck2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ID_TYPE_OPTIONS, COMMON_NATIONALITIES } from "@/lib/hotel/guests";
import { cn } from "@/lib/utils";

const schema = z.object({
  first_name: z
    .string()
    .min(2, "Prénom requis (2 caractères min.)")
    .max(80),
  last_name: z
    .string()
    .min(2, "Nom requis (2 caractères min.)")
    .max(80),
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
});

type Values = z.infer<typeof schema>;

type Props = {
  onCreated: (guest: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
  }) => void;
  onCancel?: () => void;
  /** Compact = utilisé dans la modale wizard (bouton annuler caché) */
  compact?: boolean;
};

/**
 * Formulaire inline de création rapide d'un client.
 * Adapté du modèle OGHOTEL : champs séparés Prénom / Nom,
 * Téléphone, Email, Type de document, N° Document, upload pièce d'identité.
 *
 * Le fichier sélectionné n'est pas téléversé (pas de bucket storage configuré) :
 * seul le nom du fichier est conservé et stocké dans les notes du client.
 */
export function NewClientForm({ onCreated, onCancel, compact }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [idType, setIdType] = React.useState<string>("");
  const [nationality, setNationality] = React.useState<string>("");
  const [idFileName, setIdFileName] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      nationality: "",
      id_type: undefined,
      id_number: "",
    },
  });

  const firstName = watch("first_name");
  const lastName = watch("last_name");
  const phone = watch("phone");
  const email = watch("email");

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const fullName = `${values.first_name.trim()} ${values.last_name.trim()}`.trim();
      const notesParts: string[] = [];
      if (idFileName) notesParts.push(`Pièce d'identité: ${idFileName}`);

      const payload = {
        full_name: fullName,
        phone: values.phone,
        email: values.email || null,
        nationality: values.nationality || null,
        id_type: values.id_type || null,
        id_number: values.id_number || null,
        address: null,
        notes: notesParts.length > 0 ? notesParts.join(" | ") : null,
      };

      const res = await fetch("/api/hotel/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la création du client");
        return;
      }
      toast.success("Client créé avec succès");
      onCreated({
        id: data.id,
        full_name: fullName,
        phone: values.phone,
        email: values.email || null,
      });
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border-2 border-primary/30 bg-primary/[0.03] p-4"
    >
      <div className="flex items-center gap-2 pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <UserPlus className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-primary">Nouveau client</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Prénom */}
        <div className="space-y-1.5">
          <Label htmlFor="first_name" className="text-sm">
            Prénom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            placeholder="Prénom"
            {...register("first_name")}
          />
          {errors.first_name && (
            <p className="text-xs text-destructive">{errors.first_name.message}</p>
          )}
        </div>

        {/* Nom */}
        <div className="space-y-1.5">
          <Label htmlFor="last_name" className="text-sm">
            Nom <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            placeholder="Nom"
            {...register("last_name")}
          />
          {errors.last_name && (
            <p className="text-xs text-destructive">{errors.last_name.message}</p>
          )}
        </div>

        {/* Téléphone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm">
            Téléphone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+225 XX XX XX XX"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemple.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Type de document */}
        <div className="space-y-1.5">
          <Label className="text-sm">Type de document</Label>
          <Select
            value={idType}
            onValueChange={(v) => {
              setIdType(v);
              setValue("id_type", v as Values["id_type"]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
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

        {/* N° Document */}
        <div className="space-y-1.5">
          <Label htmlFor="id_number" className="text-sm">
            N° Document
          </Label>
          <Input
            id="id_number"
            placeholder="Numéro du document"
            {...register("id_number")}
          />
        </div>
      </div>

      {/* Nationalité (optionnel) */}
      <div className="space-y-1.5">
        <Label htmlFor="nationality" className="text-sm">
          Nationalité
        </Label>
        <Input
          id="nationality"
          list="nationality-suggestions-wizard"
          placeholder="Ex : Ivoirienne"
          value={nationality}
          onChange={(e) => {
            setNationality(e.target.value);
            setValue("nationality", e.target.value);
          }}
        />
        <datalist id="nationality-suggestions-wizard">
          {COMMON_NATIONALITIES.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </div>

      {/* Pièce d'identité (upload) */}
      <div className="space-y-1.5">
        <Label className="text-sm">Pièce d'identité</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setIdFileName(f.name);
          }}
        />
        {idFileName ? (
          <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileCheck2 className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">{idFileName}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => {
                setIdFileName("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-primary/40 text-primary hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Télécharger un fichier
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          CNI, passeport ou permis (image / PDF). Le fichier est rattaché au dossier client.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && !compact && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            isLoading ||
            !firstName?.trim() ||
            !lastName?.trim() ||
            !phone?.trim()
          }
          className={cn("bg-primary text-primary-foreground hover:bg-primary/90")}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="mr-2 h-4 w-4" />
          )}
          Créer le client
        </Button>
      </div>

      {/* Récap visuel du nom complet */}
      {(firstName || lastName) && (
        <div className="rounded-md bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
          Sera enregistré sous :{" "}
          <span className="font-semibold text-foreground">
            {[firstName, lastName].filter(Boolean).join(" ").trim() || "—"}
          </span>
          {email && <> · {email}</>}
        </div>
      )}
    </form>
  );
}
