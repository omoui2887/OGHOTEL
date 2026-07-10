import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { checkRoomAvailability } from "@/lib/hotel/reservations-server";

/**
 * POST /api/hotel/reservations/availability
 *
 * Vérifie si une chambre est disponible pour les dates données.
 * Route PUBLIQUE (mais nécessite authentification).
 *
 * Body : { room_id, check_in_date, check_out_date, exclude_reservation_id? }
 * Retourne : { available: boolean, conflicts: [...] }
 *
 * 🔒 Vérification côté serveur — ne jamais faire confiance au client.
 */

const schema = z.object({
  room_id: z.string().uuid("Chambre requise"),
  check_in_date: z.string().min(1, "Date d'arrivée requise"),
  check_out_date: z.string().min(1, "Date de départ requise"),
  exclude_reservation_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
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

    const result = await checkRoomAvailability(
      parsed.data.room_id,
      parsed.data.check_in_date,
      parsed.data.check_out_date,
      parsed.data.exclude_reservation_id,
      profile.establishment_id
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Erreur /api/hotel/reservations/availability:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
