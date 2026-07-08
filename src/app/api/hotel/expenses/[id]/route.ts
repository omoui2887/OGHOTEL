import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { updateExpense, deleteExpense } from "@/lib/hotel/expenses-server";

const patchSchema = z.object({
  category: z.enum(["salaire", "electricite", "eau", "internet", "maintenance", "fournitures", "carburant", "nettoyage", "autre"]).optional(),
  amount: z.coerce.number().int().min(1).max(100000000).optional(),
  expense_date: z.string().optional(),
  payment_method: z.enum(["cash", "orange", "mtn", "moov", "wave", "card", "transfer"]).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
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

    if (!["hotel_admin", "manager", "accountant"].includes(profile.role)) {
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

    const result = await updateExpense(
      id,
      profile.establishment_id,
      profile.id,
      parsed.data
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Dépense modifiée" });
  } catch (err) {
    console.error("Erreur PATCH /api/hotel/expenses/[id]:", err);
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

    // Seul hotel_admin peut supprimer définitivement
    if (profile.role !== "hotel_admin") {
      return NextResponse.json(
        { error: "Seul un Admin Hôtel peut supprimer une dépense" },
        { status: 403 }
      );
    }

    const result = await deleteExpense(id, profile.establishment_id, profile.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Dépense supprimée" });
  } catch (err) {
    console.error("Erreur DELETE /api/hotel/expenses/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
