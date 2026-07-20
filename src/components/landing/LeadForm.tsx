"use client";

import * as React from "react";
import { Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, MessageCircle } from "lucide-react";

import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildWhatsAppUrl } from "@/lib/utils";
import { WHATSAPP_CONTACT } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const BUSINESS_TYPE_OPTIONS = [
  { value: "hotel", label: "Hôtel" },
  { value: "residence", label: "Résidence meublée" },
  { value: "auberge", label: "Auberge" },
  { value: "other", label: "Autre" },
] as const;

const PLAN_OPTIONS = [
  { value: "ESSENTIEL", label: "ESSENTIEL — 30 000 FCFA/mois" },
  { value: "PRIVILEGE", label: "PRIVILEGE — 50 000 FCFA/mois" },
  { value: "PREMIUM", label: "PREMIUM — 75 000 FCFA/mois" },
] as const;

/** Map form plan values (uppercase) to API expected values (lowercase). */
const PLAN_TO_API: Record<string, string> = {
  ESSENTIEL: "essentiel",
  PRIVILEGE: "privilege",
  PREMIUM: "premium",
};

/* -------------------------------------------------------------------------- */
/*  LeadForm — outer client component wraps inner in <Suspense> so that       */
/*  useSearchParams doesn't de-opt the whole page to client-side rendering.   */
/* -------------------------------------------------------------------------- */

export function LeadForm() {
  return (
    <Suspense fallback={<LeadFormSkeleton />}>
      <LeadFormInner />
    </Suspense>
  );
}

function LeadFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-8">
      <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-100" />
      <div className="mt-6 space-y-4">
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  LeadFormInner — the actual form with RHF + zod                            */
/* -------------------------------------------------------------------------- */

function LeadFormInner() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan"); // "ESSENTIEL" | "PRIVILEGE" | "PREMIUM" | null

  const isValidPlan = (v: string | null): v is "ESSENTIEL" | "PRIVILEGE" | "PREMIUM" =>
    v === "ESSENTIEL" || v === "PRIVILEGE" || v === "PREMIUM";

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      full_name: "",
      business_name: "",
      business_type: undefined,
      city: "",
      rooms_count: undefined,
      phone: "",
      email: "",
      desired_plan_name: isValidPlan(planParam) ? planParam : undefined,
      message: "",
      consent: false,
    },
  });

  // If the URL plan param changes after mount (e.g. user clicked a pricing CTA),
  // update the form field.
  React.useEffect(() => {
    if (isValidPlan(planParam)) {
      setValue("desired_plan_name", planParam, { shouldValidate: true });
    }
  }, [planParam, setValue]);

  const onSubmit = async (values: LeadFormValues) => {
    // Build the message field that combines city, rooms_count and the
    // optional original message — the /api/leads endpoint doesn't have
    // dedicated columns for these, so we embed them as text.
    const messageParts: string[] = [];
    if (values.city) messageParts.push(`Ville: ${values.city}`);
    if (values.rooms_count) {
      messageParts.push(`Chambres: ${values.rooms_count}`);
    }
    if (values.message && values.message.trim().length > 0) {
      messageParts.push(`Message: ${values.message.trim()}`);
    }
    const combinedMessage =
      messageParts.length > 0 ? messageParts.join(" | ") : null;

    const payload = {
      full_name: values.full_name,
      hotel_name: values.business_name,
      business_type: values.business_type,
      desired_plan: PLAN_TO_API[values.desired_plan_name] ?? "essentiel",
      phone: values.phone,
      email: values.email || "",
      message: combinedMessage,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        toast.error(
          "Trop de demandes envoyées. Réessayez dans une heure ou contactez-nous directement sur WhatsApp.",
          {
            action: {
              label: "WhatsApp",
              onClick: () =>
                window.open(
                  buildWhatsAppUrl(
                    WHATSAPP_CONTACT,
                    "Bonjour, je n'arrive pas à envoyer ma demande via le formulaire."
                  ),
                  "_blank",
                  "noopener,noreferrer"
                ),
            },
          }
        );
        return;
      }

      if (!res.ok) {
        let apiError =
          "Une erreur est survenue. Veuillez réessayer ou nous contacter sur WhatsApp.";
        try {
          const data = await res.json();
          if (data?.error && typeof data.error === "string") {
            apiError = data.error;
          }
        } catch {
          // ignore JSON parse errors — keep generic message
        }
        toast.error(apiError);
        return;
      }

      toast.success(
        "Votre demande a été envoyée. Nous vous contacterons rapidement par WhatsApp ou appel."
      );
      reset();
    } catch {
      toast.error(
        "Une erreur est survenue. Veuillez réessayer ou nous contacter sur WhatsApp."
      );
    }
  };

  return (
    <section
      id="lead-form"
      aria-labelledby="lead-form-title"
      className="bg-[#F8F6F0] py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#8a6a1f]">
            Activation
          </span>
          <h2
            id="lead-form-title"
            className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] md:text-4xl lg:text-5xl"
          >
            <span className="font-serif italic">Demander une activation</span>{" "}
            OGHOTEL
          </h2>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Remplissez ce formulaire. Nous vous contacterons rapidement par
            WhatsApp ou appel pour vous accompagner.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto mt-12 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Nom complet */}
            <Field
              id="lead-full-name"
              label="Nom complet"
              required
              error={errors.full_name?.message}
            >
              <Input
                id="lead-full-name"
                placeholder="Jean Kouassi"
                autoComplete="name"
                disabled={isSubmitting}
                aria-invalid={!!errors.full_name}
                {...register("full_name")}
              />
            </Field>

            {/* Nom de l'établissement */}
            <Field
              id="lead-business-name"
              label="Nom de l'établissement"
              required
              error={errors.business_name?.message}
            >
              <Input
                id="lead-business-name"
                placeholder="Hôtel Le Baobab"
                disabled={isSubmitting}
                aria-invalid={!!errors.business_name}
                {...register("business_name")}
              />
            </Field>

            {/* Type d'établissement */}
            <Field
              id="lead-business-type"
              label="Type d'établissement"
              required
              error={errors.business_type?.message as string | undefined}
            >
              <Controller
                control={control}
                name="business_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="lead-business-type"
                      className="w-full"
                      aria-invalid={!!errors.business_type}
                    >
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Ville / commune */}
            <Field
              id="lead-city"
              label="Ville / commune"
              required
              error={errors.city?.message}
            >
              <Input
                id="lead-city"
                placeholder="Abidjan, Cocody…"
                autoComplete="address-level2"
                disabled={isSubmitting}
                aria-invalid={!!errors.city}
                {...register("city")}
              />
            </Field>

            {/* Nombre de chambres */}
            <Field
              id="lead-rooms-count"
              label="Nombre de chambres"
              required
              error={errors.rooms_count?.message as string | undefined}
            >
              <Input
                id="lead-rooms-count"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="10"
                disabled={isSubmitting}
                aria-invalid={!!errors.rooms_count}
                {...register("rooms_count", { valueAsNumber: true })}
              />
            </Field>

            {/* Numéro WhatsApp */}
            <Field
              id="lead-phone"
              label="Numéro WhatsApp"
              required
              error={errors.phone?.message}
            >
              <Input
                id="lead-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+225 07 00 00 00 00"
                disabled={isSubmitting}
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </Field>

            {/* Email (optional) */}
            <Field
              id="lead-email"
              label="Email (optionnel)"
              error={errors.email?.message as string | undefined}
              hint="Pour vous envoyer votre code d'activation."
            >
              <Input
                id="lead-email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.ci"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            {/* Formule souhaitée */}
            <Field
              id="lead-desired-plan"
              label="Formule souhaitée"
              required
              error={errors.desired_plan_name?.message as string | undefined}
            >
              <Controller
                control={control}
                name="desired_plan_name"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="lead-desired-plan"
                      className="w-full"
                      aria-invalid={!!errors.desired_plan_name}
                    >
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          {/* Message complémentaire */}
          <Field
            id="lead-message"
            label="Message complémentaire (optionnel)"
            error={errors.message?.message as string | undefined}
            className="mt-5"
          >
            <Textarea
              id="lead-message"
              rows={4}
              placeholder="Parlez-nous de votre établissement, vos besoins spécifiques, vos questions…"
              disabled={isSubmitting}
              {...register("message")}
            />
          </Field>

          {/* Consent */}
          <div className="mt-5">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    id="lead-consent"
                    checked={field.value === true}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    disabled={isSubmitting}
                    aria-invalid={!!errors.consent}
                    className="mt-0.5"
                  />
                )}
              />
              <div>
                <Label
                  htmlFor="lead-consent"
                  className="cursor-pointer text-sm text-slate-700"
                >
                  J&apos;accepte d&apos;être contacté par OGHOTEL concernant ma
                  demande.
                </Label>
                {errors.consent?.message && (
                  <p
                    className="mt-1 text-xs text-destructive"
                    role="alert"
                  >
                    {errors.consent.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-6 w-full bg-[#D4A843] text-[#0B1F3A] hover:bg-[#c2993a] hover:shadow-lg hover:shadow-[#D4A843]/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer ma demande
              </>
            )}
          </Button>

          {/* Helper line */}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <MessageCircle className="h-3.5 w-3.5 text-[#16A34A]" />
            Réponse rapide par WhatsApp · Vos données restent confidentielles
          </p>
        </form>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field wrapper                                                              */
/* -------------------------------------------------------------------------- */

function Field({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-sm font-medium text-[#0B1F3A]">
        {label}
        {required && (
          <span className="ml-1 text-[#D4A843]" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
