import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateMaintenanceTicket, deleteMaintenanceTicket } from "@/lib/hotel/maintenance-server";

const patchSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "urgent"]).optional(),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  cost: z.coerce.number().int().min(0).max(100000000).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  set_room_maintenance: z.boolean().optional(),
  set_room_available: z.boolean().optional(),
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

    if (!["hotel_admin", "manager", "maintenance"].includes(profile.role)) {
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

    const result = await updateMaintenanceTicket(
      id,
      profile.establishment_id,
      profile.id,
      {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority,
        status: parsed.data.status,
        cost: parsed.data.cost,
        assigned_to: parsed.data.assigned_to,
        setRoomMaintenance: parsed.data.set_room_maintenance,
        setRoomAvailable: parsed.data.set_room_available,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Ticket mis à jour" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/maintenance/[id]:", err);
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
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const result = await deleteMaintenanceTicket(id, profile.establishment_id, profile.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Ticket supprimé" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/maintenance/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
