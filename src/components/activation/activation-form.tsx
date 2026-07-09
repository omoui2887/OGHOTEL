"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [verified, setVerified] = React.useState(false);

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
      setVerified(true);

      const params = new URLSearchParams({ code: data.code.code });
      if (data.code.lead_name) {
        params.set("name", data.code.lead_name);
      }
      setTimeout(() => {
        router.push(`/register?${params.toString()}`);
      }, 800);
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Champ code */}
      <div className="space-y-1.5">
        <Label htmlFor="code" className="text-sm font-medium">
          Code d&apos;activation <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            id="code"
            placeholder="HTL-XXXX-XXXX-2026"
            className="pl-10 font-mono uppercase tracking-wider"
            autoComplete="off"
            autoFocus
            disabled={isLoading || verified}
            {...register("code")}
          />
        </div>
        {errors.code && (
          <p className="text-xs text-destructive">{errors.code.message}</p>
        )}
        {codeValue && !errors.code && (
          <p className="text-xs text-muted-foreground">
            Format attendu : OGH-2026-XXXXXX
          </p>
        )}
      </div>

      {/* Bouton vérifier */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/90 hover:to-orange-600/90 hover:shadow-xl hover:shadow-primary/30"
        size="lg"
        disabled={isLoading || verified}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vérification…
          </>
        ) : verified ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Code vérifié !
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Vérifier mon code
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Note */}
      <p className="text-center text-xs text-muted-foreground">
        Le code vous a été fourni par l&apos;équipe {APP_NAME} après validation
        de votre paiement.
      </p>
    </form>
  );
}
