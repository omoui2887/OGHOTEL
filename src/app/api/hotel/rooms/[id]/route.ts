import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateRoom, deleteRoom } from "@/lib/hotel/rooms-server";

const patchSchema = z.object({
  room_type_id: z.string().uuid().optional(),
  room_number: z.string().min(1).max(50).optional(),
  floor: z.string().max(50).optional(),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  price_per_night: z.coerce.number().int().min(0).max(10000000).optional(),
  half_day_price: z.coerce.number().int().min(0).max(10000000).nullable().optional(),
  status: z.enum(["available", "reserved", "occupied", "cleaning", "maintenance", "inactive"]).optional(),
  amenities: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist", "housekeeping", "maintenance"].includes(profile.role)) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await updateRoom(id, profile.establishment_id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Chambre modifiée" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/rooms/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (profile.role !== "hotel_admin" && profile.role !== "manager") {
      return NextResponse.json(
        { error: "Seul un Admin Hôtel ou Manager peut supprimer" },
        { status: 403 }
      );
    }

    const result = await deleteRoom(id, profile.establishment_id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Chambre supprimée" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/rooms/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
