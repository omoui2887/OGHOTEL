import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import {
  updateReservation,
  cancelReservation,
  getReservationById,
} from "@/lib/hotel/reservations-server";

const patchSchema = z.object({
  guest_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  adults: z.coerce.number().int().min(1).max(50).optional(),
  children: z.coerce.number().int().min(0).max(50).optional(),
  rate_amount: z.coerce.number().int().min(0).max(10000000).optional(),
  discount_amount: z.coerce.number().int().min(0).max(10000000).optional(),
  paid_amount: z.coerce.number().int().min(0).max(10000000).optional(),
  status: z
    .enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled", "no_show"])
    .optional(),
  source: z.enum(["direct", "phone", "whatsapp", "agency", "other"]).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
  action: z.enum(["cancel"]).optional(),
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

    // Action spéciale : annulation
    if (parsed.data.action === "cancel") {
      const result = await cancelReservation(
        id,
        profile.establishment_id,
        profile.id
      );
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Réservation annulée" });
    }

    // Mise à jour normale
    const { action, ...updateData } = parsed.data;
    const result = await updateReservation(
      id,
      profile.establishment_id,
      profile.id,
      updateData
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Réservation modifiée" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/reservations/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
