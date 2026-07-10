"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  Check,
  Building2,
  ArrowRight,
  KeyRound,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const schema = z
  .object({
    code: z.string().min(1, "Code requis"),
    owner_name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100),
    establishment_name: z
      .string()
      .min(2, "Le nom de l'établissement doit contenir au moins 2 caractères")
      .max(150),
    establishment_type: z.enum(["hotel", "residence", "auberge", "other"], {
      error: "Veuillez sélectionner un type",
    }),
    city: z.string().min(2, "Ville requise").max(100),
    address: z.string().min(2, "Adresse requise").max(300),
    phone: z
      .string()
      .min(8, "Numéro invalide")
      .max(20)
      .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
    email: z
      .string()
      .min(1, "Email requis")
      .email("Email invalide")
      .max(150),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .max(128)
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[0-9]/, "Doit contenir un chiffre"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type Values = z.infer<typeof schema>;

type RegisterFormProps = {
  code: string;
  leadName?: string | null;
  planName?: string | null;
};

function passwordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 15;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[a-z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;
  return Math.min(100, score);
}

export function RegisterForm({ code, leadName, planName }: RegisterFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [establishmentType, setEstablishmentType] = React.useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code,
      owner_name: leadName ?? "",
      establishment_name: "",
      establishment_type: undefined,
      city: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const password = watch("password") ?? "";
  const strength = passwordStrength(password);
  const strengthLabel =
    strength < 40 ? "Faible" : strength < 70 ? "Moyen" : "Fort";
  const strengthColor =
    strength < 40
      ? "text-destructive"
      : strength < 70
      ? "text-amber-600"
      : "text-emerald-700";

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activation/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: values.code,
          owner_name: values.owner_name,
          establishment_name: values.establishment_name,
          establishment_type: values.establishment_type,
          city: values.city,
          address: values.address,
          phone: values.phone,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error ?? "Impossible de créer le compte");
        return;
      }

      toast.success(
        "Compte créé avec succès ! Redirection vers votre tableau de bord…"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Code vérifié (read-only) */}
      <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <BadgeCheck className="h-5 w-5 text-emerald-700" />
          <div>
            <p className="text-xs text-muted-foreground">Code vérifié</p>
            <p className="font-mono text-sm font-bold text-foreground">{code}</p>
          </div>
        </div>
        {planName && (
          <Badge variant="outline" className="border-primary/40 text-primary">
            {planName}
          </Badge>
        )}
      </div>

      {/* Section 1 : Établissement */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Informations de l&apos;établissement
          </h3>
        </div>

        {/* Nom du gérant */}
        <div className="space-y-1.5">
          <Label htmlFor="owner_name" className="text-sm font-medium">
            Nom du gérant <span className="text-destructive">*</span>
          </Label>
          <Input
            id="owner_name"
            placeholder="Ex : Jean Kouassi"
            disabled={isLoading}
            {...register("owner_name")}
          />
          {errors.owner_name && (
            <p className="text-xs text-destructive">{errors.owner_name.message}</p>
          )}
        </div>

        {/* Nom établissement */}
        <div className="space-y-1.5">
          <Label htmlFor="establishment_name" className="text-sm font-medium">
            Nom de l&apos;établissement <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="establishment_name"
              placeholder="Ex : Hôtel Le Baobab"
              className="pl-9"
              disabled={isLoading}
              {...register("establishment_name")}
            />
          </div>
          {errors.establishment_name && (
            <p className="text-xs text-destructive">{errors.establishment_name.message}</p>
          )}
        </div>

        {/* Type + Ville */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="establishment_type" className="text-sm font-medium">
              Type d&apos;établissement <span className="text-destructive">*</span>
            </Label>
            <Select
              value={establishmentType}
              onValueChange={(v) => {
                setEstablishmentType(v);
                setValue("establishment_type", v as Values["establishment_type"], {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="establishment_type">
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotel">Hôtel</SelectItem>
                <SelectItem value="residence">Résidence meublée</SelectItem>
                <SelectItem value="auberge">Auberge</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.establishment_type && (
              <p className="text-xs text-destructive">{errors.establishment_type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium">
              Ville <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Ex : Abidjan"
              disabled={isLoading}
              {...register("city")}
            />
            {errors.city && (
              <p className="text-xs text-destructive">{errors.city.message}</p>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-sm font-medium">
            Adresse <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Ex : Cocody, Rue des Jardins"
            disabled={isLoading}
            {...register("address")}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* Téléphone + Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+225 07 00 00 00 00"
              disabled={isLoading}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.ci"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 : Compte */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Identifiants du compte
          </h3>
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
          {password && (
            <div className="space-y-1">
              <Progress value={strength} className="h-1.5" />
              <p className={`text-xs font-medium ${strengthColor}`}>
                Robustesse : {strengthLabel}
              </p>
            </div>
          )}
        </div>

        {/* Confirmation mot de passe */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password" className="text-sm font-medium">
            Confirmer le mot de passe <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="pr-10"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
          )}
        </div>

        {/* Critères mot de passe */}
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3.5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Le mot de passe doit contenir :
          </p>
          <ul className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {[
              { ok: password.length >= 8, label: "Au moins 8 caractères" },
              { ok: /[A-Z]/.test(password), label: "Une majuscule" },
              { ok: /[a-z]/.test(password), label: "Une minuscule" },
              { ok: /[0-9]/.test(password), label: "Un chiffre" },
            ].map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <Check
                  className={`h-3 w-3 ${c.ok ? "text-emerald-700" : "text-muted-foreground/40"}`}
                />
                <span className={c.ok ? "text-foreground" : ""}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bouton submit */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/90 hover:to-orange-600/90 hover:shadow-xl hover:shadow-primary/30"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création du compte…
          </>
        ) : (
          <>
            Créer mon compte
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
