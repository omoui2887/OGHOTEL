import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createRoomType, getRoomTypes } from "@/lib/hotel/room-types-server";

/**
 * POST /api/hotel/room-types — Crée un type de chambre
 * GET  /api/hotel/room-types — Liste les types (usage futur)
 *
 * 🔒 Authentification + rôle hotel_user + establishment_id du profil.
 */

const schema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100, "Nom trop long"),
  default_price: z.coerce
    .number({ error: "Prix invalide" })
    .int("Le prix doit être un entier")
    .min(0, "Le prix ne peut pas être négatif")
    .max(10000000, "Prix trop élevé"),
  capacity: z.coerce
    .number({ error: "Capacité invalide" })
    .int("La capacité doit être un entier")
    .min(1, "La capacité doit être au moins 1")
    .max(50, "Capacité trop élevée"),
  description: z.string().max(1000, "Description trop longue").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist", "housekeeping"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de créer un type de chambre" },
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

    const result = await createRoomType(profile.establishment_id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Type de chambre créé",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/room-types:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
