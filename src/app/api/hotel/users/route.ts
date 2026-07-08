import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createStaffUser, getPlanLimits } from "@/lib/hotel/users-server";

const schema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide").max(150),
  password: z.string().min(8, "Au moins 8 caractères").max(128)
    .regex(/[A-Z]/, "Doit contenir une majuscule")
    .regex(/[a-z]/, "Doit contenir une minuscule")
    .regex(/[0-9]/, "Doit contenir un chiffre"),
  full_name: z.string().min(2, "Nom requis").max(100),
  phone: z.string().max(20).optional(),
  role: z.enum(["manager", "receptionist", "accountant", "housekeeping", "maintenance"], {
    error: "Rôle invalide",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (profile.role !== "hotel_admin") {
      return NextResponse.json(
        { error: "Seul l'Admin Hôtel peut créer des comptes personnel" },
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

    // Vérifier les limites du plan
    const limits = await getPlanLimits(profile.establishment_id);
    if (!limits.can_create) {
      return NextResponse.json(
        { error: `Limite d'utilisateurs atteinte (${limits.current_users}/${limits.max_users}). Passez à une formule supérieure.` },
        { status: 403 }
      );
    }

    const result = await createStaffUser(
      profile.establishment_id,
      profile.id,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Compte créé — l'utilisateur devra changer son mot de passe à la première connexion",
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/users:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
