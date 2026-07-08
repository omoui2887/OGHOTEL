import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { performCheckIn } from "@/lib/hotel/stay-server";

/**
 * POST /api/hotel/check-in
 *
 * Effectue le check-in d'une réservation.
 * - Passe réservation → checked_in
 * - Passe chambre → occupied
 * - Enregistre acompte si fourni
 * - Log activité
 *
 * 🔒 Permissions : hotel_admin, manager, receptionist
 */

const schema = z.object({
  reservation_id: z.string().uuid("Réservation requise"),
  payment: z
    .object({
      amount: z.coerce.number().int().min(0).max(10000000),
      method: z.enum(["cash", "orange", "mtn", "moov", "wave", "card", "transfer"]),
      reference: z.string().max(200).optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée — réceptionniste minimum requis" },
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

    const result = await performCheckIn(
      parsed.data.reservation_id,
      profile.establishment_id,
      profile.id,
      parsed.data.payment
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Check-in effectué — client installé dans la chambre",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/check-in:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
