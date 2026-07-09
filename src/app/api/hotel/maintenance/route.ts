import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createMaintenanceTicket } from "@/lib/hotel/maintenance-server";

const schema = z.object({
  room_id: z.string().uuid().nullable().optional(),
  title: z.string().min(2, "Le titre est requis").max(200, "Titre trop long"),
  description: z.string().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "urgent"], { error: "Priorité invalide" }),
  cost: z.coerce.number().int().min(0).max(100000000).optional(),
  set_room_maintenance: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "maintenance"].includes(profile.role)) {
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

    const result = await createMaintenanceTicket(
      profile.establishment_id,
      profile.id,
      {
        room_id: parsed.data.room_id,
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        cost: parsed.data.cost,
        setRoomMaintenance: parsed.data.set_room_maintenance,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Ticket de maintenance créé",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/maintenance:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
