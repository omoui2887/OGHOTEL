"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BUSINESS_TYPES,
  DESIRED_PLAN_OPTIONS,
} from "@/lib/constants";

const leadSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().min(6, "Le téléphone est requis"),
  hotel_name: z.string().min(2, "Le nom de l'établissement est requis"),
  business_type: z.string().min(1, "Sélectionnez un type"),
  desired_plan: z.string().min(1, "Sélectionnez une formule"),
  message: z.string().max(2000).optional(),
});

type LeadValues = z.infer<typeof leadSchema>;

export function LeadForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      hotel_name: "",
      business_type: "",
      desired_plan: "",
      message: "",
    },
  });

  const businessType = watch("business_type");
  const desiredPlan = watch("desired_plan");

  const onSubmit = async (values: LeadValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "landing" }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Impossible d'envoyer votre demande");
        return;
      }

      toast.success(
        "Demande envoyée. Notre équipe vous contacte sous 24h par WhatsApp."
      );
      setSubmitted(true);
      reset();
    } catch {
      toast.error("Erreur réseau. Réessayez ou contactez-nous par WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">
          Merci pour votre intérêt
        </h3>
        <p className="text-sm text-muted-foreground">
          Votre demande a bien été enregistrée. Notre équipe vous contacte par
          WhatsApp sous 24h pour organiser une démo et activer votre espace.
        </p>
        <Button
          variant="outline"
          className="mt-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={() => setSubmitted(false)}
        >
          Envoyer une autre demande
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-full-name">Nom complet</Label>
          <Input
            id="lead-full-name"
            placeholder="Jean Kouassi"
            disabled={isLoading}
            aria-invalid={!!errors.full_name}
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-xs text-destructive" role="alert">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-hotel-name">Nom de l&apos;établissement</Label>
          <Input
            id="lead-hotel-name"
            placeholder="Hôtel Le Baobab"
            disabled={isLoading}
            aria-invalid={!!errors.hotel_name}
            {...register("hotel_name")}
          />
          {errors.hotel_name && (
            <p className="text-xs text-destructive" role="alert">
              {errors.hotel_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-email">Email</Label>
          <Input
            id="lead-email"
            type="email"
            placeholder="vous@exemple.ci"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-phone">Téléphone / WhatsApp</Label>
          <Input
            id="lead-phone"
            type="tel"
            placeholder="+225 07 00 00 00 00"
            disabled={isLoading}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lead-business-type">Type d&apos;établissement</Label>
          <Select
            value={businessType}
            onValueChange={(v) => setValue("business_type", v)}
            disabled={isLoading}
          >
            <SelectTrigger
              id="lead-business-type"
              aria-invalid={!!errors.business_type}
            >
              <SelectValue placeholder="Sélectionner…" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((b) => (
                <SelectItem key={b.value} value={b.value}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.business_type && (
            <p className="text-xs text-destructive" role="alert">
              {errors.business_type.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead-desired-plan">Formule souhaitée</Label>
          <Select
            value={desiredPlan}
            onValueChange={(v) => setValue("desired_plan", v)}
            disabled={isLoading}
          >
            <SelectTrigger
              id="lead-desired-plan"
              aria-invalid={!!errors.desired_plan}
            >
              <SelectValue placeholder="Sélectionner…" />
            </SelectTrigger>
            <SelectContent>
              {DESIRED_PLAN_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.desired_plan && (
            <p className="text-xs text-destructive" role="alert">
              {errors.desired_plan.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lead-message">Message (optionnel)</Label>
        <Textarea
          id="lead-message"
          rows={3}
          placeholder="Parlez-nous de votre établissement, vos besoins, le nombre de chambres…"
          disabled={isLoading}
          {...register("message")}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-500 text-white hover:bg-orange-600"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Demander ma démo gratuite
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Sans engagement · Réponse sous 24h · Données confidentielles
      </p>
    </form>
  );
}
