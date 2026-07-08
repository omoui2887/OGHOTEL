import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createStayPayment } from "@/lib/hotel/payments-server";

const schema = z.object({
  reservation_id: z.string().uuid("Réservation requise"),
  amount: z.coerce
    .number({ error: "Montant invalide" })
    .int("Montant entier")
    .min(1, "Le montant doit être positif")
    .max(10000000, "Montant trop élevé"),
  method: z.enum(["cash", "orange", "mtn", "moov", "wave", "card", "transfer"], {
    error: "Moyen de paiement invalide",
  }),
  reference: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist", "accountant"].includes(profile.role)) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await createStayPayment(
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
      message: "Paiement enregistré",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/stay-payments:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
