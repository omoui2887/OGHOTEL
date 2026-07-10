"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, LogIn, Eye, EyeOff, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getRedirectPathForRole } from "@/lib/roles";

const signInSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Connexion impossible");
        return;
      }

      toast.success("Connexion réussie — redirection…");

      // Si l'utilisateur doit changer son mot de passe (compte créé par admin,
      // import initial, etc.), on le redirige vers /change-password avant tout.
      if (data.profile?.must_change_password) {
        router.push("/change-password");
        router.refresh();
        return;
      }

      const redirectTo = searchParams.get("redirect");
      const rolePath = getRedirectPathForRole(data.profile?.role);

      // 🔒 Anti open redirect : n'accepter que les chemins relatifs internes
      // (commençant par "/" mais pas "//" qui est un protocole alternatif).
      const safeRedirect =
        redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : rolePath;

      router.push(safeRedirect);
      router.refresh();
    } catch {
      toast.error("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Adresse e-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0c1e3a]" />
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.ci"
            autoComplete="email"
            autoFocus
            disabled={isLoading}
            aria-invalid={!!errors.email}
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <button
            type="button"
            className="text-xs text-muted-foreground transition-colors hover:text-[#0c1e3a]"
            onClick={() =>
              toast.info(
                "Contactez l'administrateur pour réinitialiser votre mot de passe."
              )
            }
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0c1e3a]" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={!!errors.password}
            className="pl-10 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Masquer" : "Afficher"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Se souvenir de moi */}
      <div className="flex items-center gap-2">
        <Checkbox id="remember" />
        <Label
          htmlFor="remember"
          className="text-sm text-muted-foreground cursor-pointer"
        >
          Se souvenir de moi
        </Label>
      </div>

      {/* Bouton connexion */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#0c1e3a] to-[#1a3a5f] text-white shadow-lg shadow-[#0c1e3a]/20 transition-all hover:from-[#0c1e3a]/90 hover:to-[#1a3a5f]/90 hover:shadow-xl hover:shadow-[#0c1e3a]/30"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion…
          </>
        ) : (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </>
        )}
      </Button>
    </form>
  );
}
