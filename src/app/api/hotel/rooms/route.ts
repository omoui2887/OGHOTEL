import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createRoom } from "@/lib/hotel/rooms-server";

const schema = z.object({
  room_type_id: z.string().uuid("Type de chambre requis"),
  room_number: z.string().min(1, "Le numéro est requis").max(50, "Numéro trop long"),
  floor: z.string().max(50).optional(),
  capacity: z.coerce
    .number({ error: "Capacité invalide" })
    .int("Capacité entière")
    .min(1, "Au moins 1")
    .max(50, "Trop élevé"),
  price_per_night: z.coerce
    .number({ error: "Prix invalide" })
    .int("Prix entier")
    .min(0, "Prix négatif impossible")
    .max(10000000, "Prix trop élevé"),
  half_day_price: z.coerce
    .number()
    .int()
    .min(0)
    .max(10000000)
    .optional()
    .or(z.literal("")),
  amenities: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist", "housekeeping"].includes(profile.role)) {
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

    const result = await createRoom(profile.establishment_id, {
      ...parsed.data,
      half_day_price:
        typeof parsed.data.half_day_price === "number"
          ? parsed.data.half_day_price
          : undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Chambre créée",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/rooms:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
