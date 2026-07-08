import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateRoomType, deleteRoomType } from "@/lib/hotel/room-types-server";

/**
 * PATCH /api/hotel/room-types/[id] — Modifie un type de chambre
 * DELETE /api/hotel/room-types/[id] — Supprime un type de chambre
 */

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  default_price: z.coerce.number().int().min(0).max(10000000).optional(),
  capacity: z.coerce.number().int().min(1).max(50).optional(),
  description: z.string().max(1000).optional(),
  is_active: z.boolean().optional(),
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

    if (!["hotel_admin", "manager", "receptionist", "housekeeping"].includes(profile.role)) {
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

    const result = await updateRoomType(id, profile.establishment_id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Type de chambre modifié" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/room-types/[id]:", err);
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

    const result = await deleteRoomType(id, profile.establishment_id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Type de chambre supprimé" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/room-types/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
