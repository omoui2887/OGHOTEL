import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { performCheckOut } from "@/lib/hotel/stay-server";

/**
 * POST /api/hotel/check-out
 *
 * Effectue le check-out d'une réservation.
 * - Vérifie solde (sauf si forceUnpaid par hotel_admin/manager)
 * - Passe réservation → checked_out
 * - Passe chambre → cleaning
 * - Crée tâche ménage automatique
 * - Génère facture
 * - Log activité
 *
 * 🔒 Permissions : hotel_admin, manager, receptionist
 * 🔒 forceUnpaid : uniquement hotel_admin, manager
 */

const schema = z.object({
  reservation_id: z.string().uuid("Réservation requise"),
  extra_charges: z.coerce.number().int().min(0).max(10000000).optional(),
  payment: z
    .object({
      amount: z.coerce.number().int().min(0).max(10000000),
      method: z.enum(["cash", "orange", "mtn", "moov", "wave", "card", "transfer"]),
      reference: z.string().max(200).optional(),
    })
    .optional(),
  force_unpaid: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!["hotel_admin", "manager", "receptionist"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée — réceptionniste minimum requis" },
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

    // Vérifier que seul hotel_admin/manager peut forcer un check-out avec solde impayé
    if (parsed.data.force_unpaid && profile.role !== "hotel_admin" && profile.role !== "manager") {
      return NextResponse.json(
        { error: "Seul un Admin Hôtel ou Manager peut forcer un check-out avec solde impayé" },
        { status: 403 }
      );
    }

    const result = await performCheckOut(
      parsed.data.reservation_id,
      profile.establishment_id,
      profile.id,
      {
        extraCharges: parsed.data.extra_charges,
        payment: parsed.data.payment,
        forceUnpaid: parsed.data.force_unpaid,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Check-out effectué — facture générée, tâche ménage créée",
      invoice_id: result.invoiceId,
    });
  } catch (err) {
    console.error("Erreur POST /api/hotel/check-out:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
