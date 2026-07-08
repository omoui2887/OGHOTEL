import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateStaffUser, deleteStaffUser } from "@/lib/hotel/users-server";

const patchSchema = z.object({
  role: z.enum(["manager", "receptionist", "accountant", "housekeeping", "maintenance"]).optional(),
  is_active: z.boolean().optional(),
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
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

    if (profile.role !== "hotel_admin") {
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

    const result = await updateStaffUser(id, profile.establishment_id, profile.id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Utilisateur modifié" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/users/[id]:", err);
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

    if (profile.role !== "hotel_admin") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const result = await deleteStaffUser(id, profile.establishment_id, profile.id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/users/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
