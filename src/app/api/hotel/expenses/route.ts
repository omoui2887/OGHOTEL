import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createExpense } from "@/lib/hotel/expenses-server";
import { isSafeUrl } from "@/lib/security/url";

const schema = z.object({
  category: z.enum(
    ["salaire", "electricite", "eau", "internet", "maintenance", "fournitures", "carburant", "nettoyage", "autre"],
    { error: "Catégorie invalide" }
  ),
  amount: z.coerce
    .number({ error: "Montant invalide" })
    .int("Montant entier")
    .min(1, "Le montant doit être positif")
    .max(100000000, "Montant trop élevé"),
  expense_date: z.string().min(1, "Date requise"),
  payment_method: z.enum(["cash", "orange", "mtn", "moov", "wave", "card", "transfer"]).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  attachment_url: z
    .string()
    .url()
    .refine(isSafeUrl, "L'URL de la pièce jointe doit être HTTPS et publique")
    .optional()
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "accountant"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée — Admin Hôtel, Manager ou Comptable requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await createExpense(
      profile.establishment_id,
      profile.id,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Dépense enregistrée",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/expenses:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
