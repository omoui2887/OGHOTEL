import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { updatePaymentStatus } from "@/lib/super-admin/payments-server";
import { z } from "zod";

/**
 * PATCH /api/super-admin/payments/[id]
 * Valide ou rejette un paiement.
 *
 * Body: { status: "validated" | "rejected" | "refunded" }
 *
 * 🔒 super_admin uniquement.
 */

const updateSchema = z.object({
  status: z.enum(["validated", "rejected", "refunded"], {
    error: "Statut invalide (validated, rejected ou refunded)",
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "super_admin" || !profile.is_active) {
      return NextResponse.json(
        { error: "Accès refusé — super_admin requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await updatePaymentStatus(id, parsed.data.status, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de mettre à jour le paiement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Paiement ${parsed.data.status === "validated" ? "validé" : parsed.data.status === "rejected" ? "rejeté" : "remboursé"}`,
    });
  } catch (err) {
    console.error("Erreur PATCH /api/super-admin/payments/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
