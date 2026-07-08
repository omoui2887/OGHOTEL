import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateEstablishmentSettings } from "@/lib/hotel/settings-server";

const schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(150).optional(),
  type: z.enum(["hotel", "residence", "auberge", "autre"]).optional(),
  owner_name: z.string().max(100).optional(),
  email: z.string().email("Email invalide").max(150).optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  timezone: z.string().max(50).optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (profile.role !== "hotel_admin" && profile.role !== "manager") {
      return NextResponse.json(
        { error: "Seul l'Admin Hôtel ou le Manager peut modifier les paramètres" },
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

    const result = await updateEstablishmentSettings(
      profile.establishment_id,
      profile.id,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Paramètres enregistrés" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/settings:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
