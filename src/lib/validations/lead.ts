import { z } from "zod";

export const leadSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis"),
  business_name: z.string().min(2, "Le nom de l'établissement est requis"),
  business_type: z.enum(["hotel", "residence", "auberge", "other"], {
    error: "Veuillez sélectionner un type d'établissement",
  }),
  city: z.string().min(2, "La ville est requise"),
  rooms_count: z
    .number({ error: "Nombre invalide" })
    .int("Nombre entier requis")
    .min(1, "Au moins 1 chambre")
    .max(1000, "Trop élevé"),
  phone: z
    .string()
    .min(8, "Numéro WhatsApp invalide")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
  email: z
    .string()
    .email("Email invalide")
    .max(150)
    .optional()
    .or(z.literal("")),
  desired_plan_name: z.enum(["ESSENTIEL", "PRIVILEGE", "PREMIUM"]),
  message: z.string().max(2000).optional().or(z.literal("")),
  consent: z
    .boolean()
    .refine((v) => v === true, "Vous devez accepter d'être contacté"),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
