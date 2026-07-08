import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { resetStaffPassword } from "@/lib/hotel/users-server";

const schema = z.object({
  new_password: z.string().min(8, "Au moins 8 caractères").max(128)
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
});

export async function POST(
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
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await resetStaffPassword(
      id,
      profile.establishment_id,
      profile.id,
      parsed.data.new_password
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé — l'utilisateur devra le changer à la prochaine connexion",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/users/[id]/reset-password:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
