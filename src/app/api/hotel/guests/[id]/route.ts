import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateGuest, deleteGuest } from "@/lib/hotel/guests-server";

const patchSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .min(8, "Numéro invalide")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide")
    .optional(),
  email: z.string().email("Email invalide").max(150).optional().or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  id_type: z.enum(["cni", "passport", "permit", "other"]).optional(),
  id_number: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
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

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
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

    const result = await updateGuest(id, profile.establishment_id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Client modifié" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/guests/[id]:", err);
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

    const result = await deleteGuest(id, profile.establishment_id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Client supprimé" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/guests/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
