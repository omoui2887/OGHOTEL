"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Ticket, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

const schema = z.object({
  code: z
    .string()
    .min(1, "Veuillez saisir votre code d'activation")
    .max(50, "Code trop long"),
});

type Values = z.infer<typeof schema>;

export function ActivationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const codeValue = watch("code");

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activation/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: values.code }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        toast.error(data.error ?? "Code invalide");
        return;
      }

      toast.success("Code vérifié — redirection vers l'inscription");

      const params = new URLSearchParams({ code: data.code.code });
      if (data.code.lead_name) {
        params.set("name", data.code.lead_name);
      }
      router.push(`/register?${params.toString()}`);
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="code">
            Code d'activation <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="code"
              placeholder="Ex : OGH-2026-XXXXXX"
              className="pl-9 font-mono uppercase"
              autoComplete="off"
              autoFocus
              disabled={isLoading}
              {...register("code")}
            />
          </div>
          {errors.code && (
            <p className="text-xs text-destructive">{errors.code.message}</p>
          )}
          {codeValue && (
            <p className="text-xs text-muted-foreground">
              Format attendu : OGH-2026-XXXXXX
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Vérifier mon code
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">
          Comment obtenir un code ?
        </p>
        <p>
          Le code d'activation vous est fourni par l'équipe {APP_NAME} après
          validation de votre paiement (Mobile Money, espèces ou virement).
          Contactez-nous au +225 05 76 10 32 77 si vous n'avez pas reçu votre code.
        </p>
      </div>
    </CardContent>
  );
}
