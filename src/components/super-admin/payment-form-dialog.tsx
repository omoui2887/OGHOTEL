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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/super-admin/payments";

const schema = z.object({
  recipient_type: z.enum(["lead", "establishment"], {
    error: "Veuillez sélectionner un prospect ou un client",
  }),
  recipient_id: z.string().min(1, "Veuillez sélectionner un destinataire"),
  plan_id: z.string().uuid("Veuillez sélectionner une formule"),
  amount_fcfa: z.coerce
    .number({ error: "Montant invalide" })
    .int("Le montant doit être un entier")
    .min(1, "Le montant doit être positif")
    .max(10000000, "Montant trop élevé"),
  payment_method: z.enum(
    ["orange", "mtn", "moov", "wave", "cash", "card", "transfer"],
    { error: "Moyen de paiement invalide" }
  ),
  transaction_reference: z.string().max(200).optional().or(z.literal("")),
  paid_at: z.string().optional().or(z.literal("")),
  note: z.string().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type PaymentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: { id: string; full_name: string; business_name: string }[];
  establishments: { id: string; name: string; owner_name: string | null }[];
  plans: { id: string; name: string; price_fcfa: number }[];
};

export function PaymentFormDialog({
  open,
  onOpenChange,
  leads,
  establishments,
  plans,
}: PaymentFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [recipientType, setRecipientType] = React.useState<"lead" | "establishment">("lead");
  const [recipientId, setRecipientId] = React.useState("");
  const [planId, setPlanId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipient_type: "lead",
      recipient_id: "",
      plan_id: "",
      amount_fcfa: 0,
      payment_method: undefined,
      transaction_reference: "",
      paid_at: "",
      note: "",
    },
  });

  // Quand le plan change, pré-remplir le montant
  React.useEffect(() => {
    if (planId) {
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setValue("amount_fcfa", plan.price_fcfa);
      }
    }
  }, [planId, plans, setValue]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        plan_id: values.plan_id,
        amount_fcfa: values.amount_fcfa,
        payment_method: values.payment_method,
        transaction_reference: values.transaction_reference || undefined,
        paid_at: values.paid_at ? new Date(values.paid_at).toISOString() : undefined,
        note: values.note || undefined,
      };

      if (values.recipient_type === "lead") {
        body.lead_id = values.recipient_id;
      } else {
        body.establishment_id = values.recipient_id;
      }

      const res = await fetch("/api/super-admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Impossible d'enregistrer le paiement");
        return;
      }

      toast.success("Paiement enregistré (en attente de validation)");
      reset();
      setRecipientId("");
      setPlanId("");
      setPaymentMethod("");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement SaaS</DialogTitle>
          <DialogDescription>
            Le paiement sera enregistré avec le statut "en attente". Validez-le
            ensuite pour pouvoir générer un code d'activation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type destinataire */}
          <div className="space-y-2">
            <Label>Type de destinataire</Label>
            <Select
              value={recipientType}
              onValueChange={(v) => {
                setRecipientType(v as "lead" | "establishment");
                setValue("recipient_type", v as "lead" | "establishment");
                setRecipientId("");
                setValue("recipient_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Prospect</SelectItem>
                <SelectItem value="establishment">Client (établissement)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destinataire */}
          <div className="space-y-2">
            <Label>
              {recipientType === "lead" ? "Prospect" : "Établissement"} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={recipientId}
              onValueChange={(v) => {
                setRecipientId(v);
                setValue("recipient_id", v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                {recipientType === "lead"
                  ? leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.full_name} — {l.business_name}
                      </SelectItem>
                    ))
                  : establishments.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} {e.owner_name ? `(${e.owner_name})` : ""}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.recipient_id && (
              <p className="text-xs text-destructive">{errors.recipient_id.message}</p>
            )}
          </div>

          {/* Formule */}
          <div className="space-y-2">
            <Label>
              Formule <span className="text-destructive">*</span>
            </Label>
            <Select
              value={planId}
              onValueChange={(v) => {
                setPlanId(v);
                setValue("plan_id", v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {new Intl.NumberFormat("fr-FR").format(p.price_fcfa)} FCFA/an
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.plan_id && (
              <p className="text-xs text-destructive">{errors.plan_id.message}</p>
            )}
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount_fcfa">
              Montant (FCFA) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount_fcfa"
              type="number"
              min={1}
              step={1000}
              {...register("amount_fcfa")}
            />
            {errors.amount_fcfa && (
              <p className="text-xs text-destructive">{errors.amount_fcfa.message}</p>
            )}
          </div>

          {/* Moyen de paiement */}
          <div className="space-y-2">
            <Label>
              Moyen de paiement <span className="text-destructive">*</span>
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => {
                setPaymentMethod(v);
                setValue("payment_method", v as FormValues["payment_method"]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-xs text-destructive">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Référence transaction */}
          <div className="space-y-2">
            <Label htmlFor="transaction_reference">
              Référence de transaction (optionnel)
            </Label>
            <Input
              id="transaction_reference"
              placeholder="Ex : MP240107.1234.ABCD"
              {...register("transaction_reference")}
            />
          </div>

          {/* Date de paiement */}
          <div className="space-y-2">
            <Label htmlFor="paid_at">Date du paiement (optionnel)</Label>
            <Input
              id="paid_at"
              type="datetime-local"
              {...register("paid_at")}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              rows={2}
              placeholder="Informations complémentaires..."
              {...register("note")}
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
