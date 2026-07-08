import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { generateInvoice } from "@/lib/hotel/invoices-server";

const schema = z.object({
  reservation_id: z.string().uuid("Réservation requise"),
  type: z.enum(["invoice", "receipt"], { error: "Type invalide" }),
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

    const result = await generateInvoice(
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
      message: parsed.data.type === "invoice" ? "Facture générée" : "Reçu généré",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/invoices/generate:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
