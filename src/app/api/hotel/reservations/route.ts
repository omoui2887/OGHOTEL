import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import {
  createReservation,
  checkRoomAvailability,
} from "@/lib/hotel/reservations-server";

/**
 * POST /api/hotel/reservations — Crée une réservation
 *
 * 🔒 Vérification des conflits côté serveur (checkRoomAvailability).
 *    Empêche toute double réservation sur des dates qui se chevauchent.
 */

const schema = z.object({
  guest_id: z.string().uuid("Client requis"),
  room_id: z.string().uuid("Chambre requise"),
  check_in_date: z.string().min(1, "Date d'arrivée requise"),
  check_out_date: z.string().min(1, "Date de départ requise"),
  adults: z.coerce.number().int().min(1, "Au moins 1 adulte").max(50).default(1),
  children: z.coerce.number().int().min(0).max(50).default(0),
  rate_amount: z.coerce
    .number({ error: "Tarif invalide" })
    .int("Tarif entier")
    .min(0, "Tarif négatif impossible")
    .max(10000000),
  discount_amount: z.coerce.number().int().min(0).max(10000000).optional().default(0),
  paid_amount: z.coerce.number().int().min(0).max(10000000).optional().default(0),
  source: z.enum(["direct", "phone", "whatsapp", "agency", "other"], {
    error: "Source invalide",
  }),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
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

    const result = await createReservation(
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
      message: "Réservation créée",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/reservations:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
