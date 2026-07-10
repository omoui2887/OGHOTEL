import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createGuest, getGuests } from "@/lib/hotel/guests-server";

const schema = z.object({
  full_name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Nom trop long"),
  phone: z
    .string()
    .min(8, "Numéro de téléphone invalide")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numéro invalide"),
  email: z
    .string()
    .email("Email invalide")
    .max(150)
    .optional()
    .or(z.literal(""))
    .nullable(),
  nationality: z.string().max(100).optional().or(z.literal("")).nullable(),
  id_type: z.enum(["cni", "passport", "permit", "other"]).optional().nullable(),
  id_number: z.string().max(100).optional().or(z.literal("")).nullable(),
  address: z.string().max(300).optional().or(z.literal("")).nullable(),
  notes: z.string().max(2000).optional().or(z.literal("")).nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
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

    const result = await createGuest(profile.establishment_id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Client créé",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/guests:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
